"""Authentication (Emergent-managed Google Auth) helpers."""
import os
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import HTTPException, Request, Response, status
import httpx


EMERGENT_AUTH_SESSION_DATA_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


async def fetch_session_data(session_id: str) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            EMERGENT_AUTH_SESSION_DATA_URL,
            headers={"X-Session-ID": session_id},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail=f"Auth exchange failed: {resp.text[:200]}")
    return resp.json()


def set_session_cookie(response: Response, session_token: str) -> None:
    # 7 days
    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 60 * 60,
        path="/",
        httponly=True,
        secure=True,
        samesite="none",
    )


def clear_session_cookie(response: Response) -> None:
    response.set_cookie(
        key="session_token",
        value="",
        max_age=0,
        path="/",
        httponly=True,
        secure=True,
        samesite="none",
    )


async def get_current_user(request: Request, db) -> dict:
    # 1) cookie first, then Authorization header
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization") or ""
        if auth_header.startswith("Bearer "):
            session_token = auth_header[7:].strip()
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return user_doc


def require_roles(*roles):
    async def _dep(request: Request):
        # actual role check attached later in route level using get_current_user
        return roles
    return _dep

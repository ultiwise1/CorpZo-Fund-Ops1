import { useEffect, useState } from "react";
import { api } from "./api";

let cachedPromise = null;

export function fetchMyPermissions() {
  if (!cachedPromise) {
    cachedPromise = api.get("/me/permissions").then(r => r.data).catch(() => ({ role: null, permissions: [] }));
  }
  return cachedPromise;
}

export function clearPermissionsCache() {
  cachedPromise = null;
  window.dispatchEvent(new CustomEvent("perms:refresh"));
}

export function usePermissions() {
  const [state, setState] = useState({ loading: true, role: null, permissions: [] });
  useEffect(() => {
    let mounted = true;
    const load = () => fetchMyPermissions().then(d => {
      if (mounted) setState({ loading: false, role: d.role, permissions: d.permissions || [] });
    });
    load();
    const handler = () => { if (mounted) load(); };
    window.addEventListener("perms:refresh", handler);
    return () => { mounted = false; window.removeEventListener("perms:refresh", handler); };
  }, []);
  const has = (key) => (state.permissions || []).includes(key);
  return { ...state, has };
}

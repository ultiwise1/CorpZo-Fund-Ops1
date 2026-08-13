"""UID generation with atomic counters."""
from datetime import datetime, timezone


async def next_uid(db, key: str, prefix: str, pad: int = 6, use_year: bool = True) -> str:
    year = datetime.now(timezone.utc).year
    counter_key = f"{key}_{year}" if use_year else key
    result = await db.counters.find_one_and_update(
        {"_id": counter_key},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    seq = result["seq"] if result else 1
    if use_year:
        return f"{prefix}-{year}-{seq:0{pad}d}"
    return f"{prefix}-{seq:0{pad}d}"


UID_CONFIG = {
    "lead": ("LD", 6, True),
    "client": ("CL", 6, True),
    "case": ("CS", 6, True),
    "employee": ("EMP", 4, False),
    "channel_partner": ("CP", 4, False),
    "application": ("LA", 6, True),
    "mandate": ("MAN", 6, True),
    "payment": ("PAY", 6, True),
    "invoice": ("INV", 6, True),
    "sanction": ("SN", 6, True),
    "disbursement": ("DB", 6, True),
    "task": ("TSK", 6, True),
    "opportunity": ("OPP", 6, True),
}


async def gen_uid(db, entity: str) -> str:
    prefix, pad, use_year = UID_CONFIG[entity]
    return await next_uid(db, entity, prefix, pad, use_year)

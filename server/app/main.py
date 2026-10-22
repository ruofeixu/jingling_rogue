from __future__ import annotations

import hashlib
import json
from typing import Any, Literal

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

MAX_PAYLOAD_BYTES = 64 * 1024
VALID_SLOTS = {0, 1, 2, 3, 4}

app = FastAPI(title="Jingling Rogue Save API")

sessions: dict[str, str] = {}
accounts: dict[str, dict[str, Any]] = {}
runs: dict[tuple[str, int], dict[str, Any]] = {}
daily_scores: dict[tuple[str, str], int] = {}


def reset_store() -> None:
    sessions.clear()
    accounts.clear()
    runs.clear()
    daily_scores.clear()


class LoginIn(BaseModel):
    code: str = Field(min_length=1, max_length=128)


class LoginOut(BaseModel):
    account_id: str
    session_token: str


class SaveIn(BaseModel):
    revision: int = Field(ge=0, le=1_000_000)
    payload: dict[str, Any]


class DailyScoreIn(BaseModel):
    utcDate: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    wave: int = Field(ge=1, le=10_000)


def _account_id(platform: str, code: str) -> str:
    digest = hashlib.sha256(f"{platform}:{code}".encode("utf-8")).hexdigest()[:16]
    return f"{platform}_{digest}"


def _issue(platform: Literal["wx", "tt"], code: str) -> LoginOut:
    account_id = _account_id(platform, code)
    token = hashlib.sha256(f"session:{account_id}:{code}".encode("utf-8")).hexdigest()
    sessions[token] = account_id
    return LoginOut(account_id=account_id, session_token=token)


def _require_account(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing token")
    token = authorization.removeprefix("Bearer ").strip()
    account_id = sessions.get(token)
    if not account_id:
        raise HTTPException(status_code=401, detail="invalid token")
    return account_id


def _check_payload(payload: dict[str, Any]) -> None:
    size = len(json.dumps(payload, ensure_ascii=False).encode("utf-8"))
    if size > MAX_PAYLOAD_BYTES:
        raise HTTPException(status_code=413, detail="payload too large")


@app.post("/auth/wx", response_model=LoginOut)
def auth_wx(body: LoginIn) -> LoginOut:
    return _issue("wx", body.code)


@app.post("/auth/tt", response_model=LoginOut)
def auth_tt(body: LoginIn) -> LoginOut:
    return _issue("tt", body.code)


@app.get("/save/account")
def get_account(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    account_id = _require_account(authorization)
    stored = accounts.get(account_id)
    if not stored:
        return {"revision": 0, "payload": {"codex": [], "unlockedStarters": []}}
    return stored


@app.put("/save/account")
def put_account(
    body: SaveIn,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    account_id = _require_account(authorization)
    _check_payload(body.payload)
    stored = accounts.get(account_id)
    current_rev = int(stored["revision"]) if stored else 0
    if body.revision != current_rev:
        raise HTTPException(status_code=409, detail="revision conflict")
    saved = {"revision": current_rev + 1, "payload": body.payload}
    accounts[account_id] = saved
    return saved


@app.get("/save/run/{slot}")
def get_run(slot: int, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    account_id = _require_account(authorization)
    if slot not in VALID_SLOTS:
        raise HTTPException(status_code=400, detail="slot must be 0-4")
    stored = runs.get((account_id, slot))
    if not stored:
        return {"revision": 0, "payload": None}
    return stored


@app.put("/save/run/{slot}")
def put_run(
    slot: int,
    body: SaveIn,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    account_id = _require_account(authorization)
    if slot not in VALID_SLOTS:
        raise HTTPException(status_code=400, detail="slot must be 0-4")
    _check_payload(body.payload)
    stored = runs.get((account_id, slot))
    current_rev = int(stored["revision"]) if stored else 0
    if body.revision != current_rev:
        raise HTTPException(status_code=409, detail="revision conflict")
    saved = {"revision": current_rev + 1, "payload": body.payload}
    runs[(account_id, slot)] = saved
    return saved


def _board_hash(account_id: str) -> str:
    return hashlib.sha256(f"board:{account_id}".encode("utf-8")).hexdigest()[:12]


@app.put("/daily/score")
def put_daily_score(
    body: DailyScoreIn,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    account_id = _require_account(authorization)
    key = (body.utcDate, account_id)
    daily_scores[key] = max(daily_scores.get(key, 0), body.wave)
    return {"ok": True, "wave": daily_scores[key]}


@app.get("/daily/board")
def get_daily_board(date: str) -> dict[str, Any]:
    if len(date) != 10 or date[4] != "-" or date[7] != "-":
        raise HTTPException(status_code=400, detail="invalid date")
    entries = [
        {"hash": _board_hash(account_id), "wave": wave}
        for (utc_date, account_id), wave in daily_scores.items()
        if utc_date == date
    ]
    entries.sort(key=lambda row: row["wave"], reverse=True)
    return {"date": date, "entries": entries}

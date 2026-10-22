from fastapi.testclient import TestClient

from app.main import app, reset_store


client = TestClient(app)


def setup_function() -> None:
    reset_store()


def test_wx_login_returns_session() -> None:
    res = client.post("/auth/wx", json={"code": "wx-test-code"})
    assert res.status_code == 200
    body = res.json()
    assert body["account_id"]
    assert body["session_token"]


def test_tt_login_returns_session() -> None:
    res = client.post("/auth/tt", json={"code": "tt-test-code"})
    assert res.status_code == 200
    assert res.json()["session_token"]


def test_save_account_requires_auth() -> None:
    res = client.put("/save/account", json={"revision": 0, "payload": {"codex": []}})
    assert res.status_code == 401


def test_save_account_round_trip() -> None:
    token = client.post("/auth/wx", json={"code": "a"}).json()["session_token"]
    headers = {"Authorization": f"Bearer {token}"}
    put = client.put(
        "/save/account",
        headers=headers,
        json={"revision": 0, "payload": {"codex": ["zao_li"]}},
    )
    assert put.status_code == 200
    got = client.get("/save/account", headers=headers)
    assert got.status_code == 200
    assert got.json()["payload"]["codex"] == ["zao_li"]
    assert got.json()["revision"] == 1


def test_run_slot_4_ok_slot_5_rejected() -> None:
    token = client.post("/auth/wx", json={"code": "b"}).json()["session_token"]
    headers = {"Authorization": f"Bearer {token}"}
    ok = client.put(
        "/save/run/4",
        headers=headers,
        json={"revision": 0, "payload": {"wave": 9}},
    )
    assert ok.status_code == 200
    got = client.get("/save/run/4", headers=headers)
    assert got.json()["payload"]["wave"] == 9
    bad = client.put(
        "/save/run/5",
        headers=headers,
        json={"revision": 0, "payload": {"wave": 1}},
    )
    assert bad.status_code == 400


def test_run_body_too_large() -> None:
    token = client.post("/auth/wx", json={"code": "c"}).json()["session_token"]
    headers = {"Authorization": f"Bearer {token}"}
    blob = {"note": "x" * 80_000}
    res = client.put(
        "/save/run/0",
        headers=headers,
        json={"revision": 0, "payload": blob},
    )
    assert res.status_code == 413


def test_revision_conflict() -> None:
    token = client.post("/auth/wx", json={"code": "d"}).json()["session_token"]
    headers = {"Authorization": f"Bearer {token}"}
    client.put(
        "/save/account",
        headers=headers,
        json={"revision": 0, "payload": {"codex": []}},
    )
    res = client.put(
        "/save/account",
        headers=headers,
        json={"revision": 0, "payload": {"codex": ["zao_li"]}},
    )
    assert res.status_code == 409


def test_daily_board_hashes_account_and_isolates_utc_date() -> None:
    token = client.post("/auth/wx", json={"code": "board-a"}).json()["session_token"]
    headers = {"Authorization": f"Bearer {token}"}
    put = client.put(
        "/daily/score",
        headers=headers,
        json={"utcDate": "2026-08-18", "wave": 40},
    )
    assert put.status_code == 200
    board = client.get("/daily/board", params={"date": "2026-08-18"})
    assert board.status_code == 200
    rows = board.json()["entries"]
    assert len(rows) == 1
    assert rows[0]["wave"] == 40
    assert "account_id" not in rows[0]
    assert rows[0]["hash"]
    assert "wx-" not in rows[0]["hash"]
    other = client.get("/daily/board", params={"date": "2026-08-19"})
    assert other.json()["entries"] == []


def test_daily_board_keeps_highest_wave() -> None:
    token = client.post("/auth/wx", json={"code": "board-b"}).json()["session_token"]
    headers = {"Authorization": f"Bearer {token}"}
    client.put("/daily/score", headers=headers, json={"utcDate": "2026-08-18", "wave": 12})
    client.put("/daily/score", headers=headers, json={"utcDate": "2026-08-18", "wave": 30})
    client.put("/daily/score", headers=headers, json={"utcDate": "2026-08-18", "wave": 20})
    rows = client.get("/daily/board", params={"date": "2026-08-18"}).json()["entries"]
    assert rows[0]["wave"] == 30

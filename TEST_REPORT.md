# Test report

Verified on 25 October 2026 against the updated source snapshot in this ZIP. The verification environment was Linux with Python 3.12.14 and Node.js 24.22.1. The original development environment used Windows with Python 3.13.2 and Node.js 24.18.0; rerun these commands there after copying the updated files.

| Check | Command | Result |
| --- | --- | --- |
| Backend tests and coverage | `python -m pytest -q --cov=app --cov-report=term-missing` from `backend` | **49 passed**, 1 dependency deprecation warning, **91% total statement coverage** |
| Frontend tests | `npm test` from `frontend` | **15 passed** across 2 test files |
| Production frontend build | `npm run build` from `frontend` | Passed; Vite 8.3.5 produced `dist/` |
| Lint | `npm run lint` from `frontend` | Passed with no lint findings |
| Same-origin smoke check | FastAPI `TestClient` after frontend build | `/` 200 HTML, `/health` 200 JSON, `/api/vehicles` 401 without bearer token, `/favicon.svg` 200 SVG |
| Configured SQLite persistence | Register in one Python process, log in from a second process against a temporary `DATABASE_PATH` | Passed; account persisted in the selected database file |

Backend coverage from the final run:

```text
Name              Stmts   Miss  Cover
------------------------------------
app/__init__.py       0      0   100%
app/admin.py         40     17    58%
app/auth.py          46      0   100%
app/database.py      13      2    85%
app/main.py          22      1    95%
app/models.py        19      0   100%
app/security.py      43      4    91%
app/vehicles.py      90      1    99%
------------------------------------
TOTAL               273     25    91%
```

The warning comes from the installed FastAPI/Starlette `TestClient` integration and does not fail the tests. It should be reevaluated when those dependencies are updated. The Docker image was **not built in this verification environment** because Docker was unavailable; the deployment steps need a live Render smoke check. No live deployment or screenshots are claimed in this report.

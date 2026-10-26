# Vote server

In-memory Node HTTP service for live Ethics Council principle votes.

```bash
npm start          # http://localhost:8787
npm test           # tally unit tests
PORT=8787 CORS_ORIGIN=https://youruser.github.io npm start
```

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/rooms` | Start voting → `{ code }` |
| GET | `/rooms/:code` | Current `{ open, votes, tally }` |
| POST | `/rooms/:code/votes` | Body `{ principles: [a,b,c] }` (duplicates count) |
| GET | `/rooms/:code/stream` | SSE of the same snapshot |
| POST | `/rooms/:code/stop` | Close the room |
| POST | `/rooms/:code/clear` | Empty votes |
| GET | `/health` | Liveness |

No auth, no database. Rooms expire after 6 hours (`ROOM_TTL_MS`).

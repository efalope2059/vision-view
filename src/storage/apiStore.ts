// Not built in v1. This is where the backend plugs in.
//
// An ApiStore class would implement the same `Store` interface (Store.ts) by calling an
// API Gateway HTTP API backed by Lambda + DynamoDB, with a Cognito token on each request:
//
//   getSnapshot()              GET    /me/snapshot
//   saveProfile(profile)       PUT    /me/profile
//   saveArea(area)             PUT    /me/areas/{id}
//   saveHabit(habit)           PUT    /me/habits/{id}
//   saveLink(link)             PUT    /me/links/{id}
//   deleteLink(id)             DELETE /me/links/{id}
//   setCheckin(h, day, done)   PUT    /me/checkins/{habitId}:{dayKey}
//   resetAll()                 DELETE /me/data
//
// DynamoDB single table: PK = USER#<userId>, SK = PROFILE | AREA#<id> | HABIT#<id> |
// LINK#<id> | CHECKIN#<dayKey>#<habitId>. IDs are already client-generated UUIDs and days
// are already string keys, so nothing needs re-keying.
//
// Switching over is a one-line change in storage/index.ts.

export {}

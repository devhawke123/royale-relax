# backend

Placeholder for the future backend/API service.

The Next.js app in [`../frontend`](../frontend) currently talks to Postgres directly through
Prisma (see `frontend/src/lib/prisma.ts`). When a standalone backend service is introduced, it
should live here and share the root-level Prisma schema (`../prisma/schema.prisma`) and generated
client (`../generated/prisma`) so both `frontend` and `backend` read from the same data layer.

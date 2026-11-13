import type { Role } from '../data/ops';

export function json(data: unknown, status = 200, extra?: HeadersInit) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...Object.fromEntries(new Headers(extra)) },
  });
}

const RANK: Record<Role, number> = { worker: 1, manager: 2, owner: 3 };

/** @deprecated Use guardStaff from staff-auth.ts in API routes. */
export function allows(role: Role, minimum: Role) {
  return RANK[role] >= RANK[minimum];
}

export function guard(request: Request, minimum: Role): { session: never } | { error: Response } {
  void request;
  void minimum;
  return { error: json({ error: 'Use guardStaff(cookies, request, role) in API routes.' }, 500) };
}

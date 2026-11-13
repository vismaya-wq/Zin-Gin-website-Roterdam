import type { AstroCookies } from 'astro';
import type { Role } from '../data/ops';
import { isSupabaseConfigured } from '../lib/supabase/env';
import { cookieStoreFromAstro, createSupabaseServerClient, getStaffSession } from '../lib/supabase/server';
import { allows as legacyAllows, sessionFromRequest } from './auth';
import { json } from './http';

const RANK: Record<Role, number> = { worker: 1, manager: 2, owner: 3 };

export function roleAtLeast(role: Role, minimum: Role) {
  return RANK[role] >= RANK[minimum];
}

export type StaffSession = {
  sub: string;
  name: string;
  role: Role;
  email?: string;
};

function mapLegacyRole(role: string): Role | null {
  if (role === 'owner' || role === 'manager' || role === 'worker') return role;
  if (role === 'admin') return 'owner';
  if (role === 'staff') return 'worker';
  return null;
}

export async function resolveStaffSession(cookies: AstroCookies, request: Request): Promise<StaffSession | null> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServerClient(cookieStoreFromAstro(cookies, request));
    const session = await getStaffSession(supabase);
    return session as StaffSession | null;
  }
  const legacy = sessionFromRequest(request);
  if (!legacy) return null;
  const role = mapLegacyRole(legacy.role);
  if (!role) return null;
  return { sub: legacy.sub, name: legacy.name, role };
}

export async function guardStaff(cookies: AstroCookies, request: Request, minimum: Role) {
  const session = await resolveStaffSession(cookies, request);
  if (!session) return { error: json({ error: 'Sign in required.' }, 401) as Response };
  if (isSupabaseConfigured()) {
    if (!roleAtLeast(session.role, minimum)) {
      return { error: json({ error: 'You do not have access to that.' }, 403) as Response };
    }
    const supabase = createSupabaseServerClient(cookieStoreFromAstro(cookies, request));
    return { session, supabase };
  }
  const legacyRole = session.role === 'owner' ? 'admin' : session.role === 'worker' ? 'staff' : 'manager';
  const needed: ('admin' | 'manager' | 'staff')[] =
    minimum === 'owner' ? ['admin'] : minimum === 'manager' ? ['manager', 'admin'] : ['staff', 'manager', 'admin'];
  if (!legacyAllows(legacyRole as 'admin' | 'manager' | 'staff', needed)) {
    return { error: json({ error: 'You do not have access to that.' }, 403) as Response };
  }
  return { session, supabase: null as null };
}

export function supabaseFromGuard(guardResult: { supabase: ReturnType<typeof createSupabaseServerClient> | null }) {
  return guardResult.supabase;
}

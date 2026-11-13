import fs from 'node:fs';
import path from 'node:path';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { LegacyStaffRole } from '../data/ops';

export interface Session {
  sub: string;
  role: LegacyStaffRole;
  name: string;
  exp: number;
}

const COOKIE = 'zg_session';

let memorySecret: string | null = null;

function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (memorySecret) return memorySecret;
  const dir = path.join(process.cwd(), 'data', 'runtime');
  const file = path.join(dir, 'secret');
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    const value = randomBytes(32).toString('hex');
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file, value);
    } catch {
      memorySecret = value;
    }
    return value;
  }
}

export function createToken(session: Omit<Session, 'exp'>, hours = 12) {
  const payload: Session = { ...session, exp: Date.now() + hours * 60 * 60 * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function readToken(token: string): Session | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(body, 'base64url').toString()) as Session;
    if (!session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function sessionFromRequest(request: Request): Session | null {
  const raw = request.headers.get('cookie') || '';
  const piece = raw
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`));
  if (!piece) return null;
  return readToken(decodeURIComponent(piece.slice(COOKIE.length + 1)));
}

export function sessionCookie(token: string, maxAge = 60 * 60 * 12) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearCookie() {
  return `${COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

export function allows(role: LegacyStaffRole, roles: LegacyStaffRole[]) {
  if (role === 'admin') return true;
  return roles.includes(role);
}

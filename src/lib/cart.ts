import { atom, computed } from 'nanostores';
import { byId, PICKUP_DISCOUNT, type MenuItem } from '../data/menu';

const STORAGE_KEY = 'zg-cart-v1';

export type CartLines = Record<string, number>;
export type DrawerView = 'cart' | 'details' | 'done';

function readStored(): CartLines {
  if (typeof localStorage === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return Object.fromEntries(
      Object.entries(parsed).filter(([id, qty]) => byId(id) && typeof qty === 'number' && qty > 0),
    ) as CartLines;
  } catch {
    return {};
  }
}

export const $cart = atom<CartLines>({});
export const $drawerOpen = atom(false);
export const $drawerView = atom<DrawerView>('cart');

let hydrated = false;
export function hydrateCart() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  $cart.set(readStored());
  $cart.listen((lines) => localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)));
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) $cart.set(readStored());
  });
}

export interface CartLine {
  item: MenuItem;
  qty: number;
  lineTotal: number;
}

export const $lines = computed($cart, (lines): CartLine[] =>
  Object.entries(lines)
    .map(([id, qty]) => {
      const item = byId(id);
      return item ? { item, qty, lineTotal: item.price * qty } : null;
    })
    .filter((line): line is CartLine => line !== null),
);

export const $count = computed($lines, (lines) => lines.reduce((sum, line) => sum + line.qty, 0));
export const $subtotal = computed($lines, (lines) => lines.reduce((sum, line) => sum + line.lineTotal, 0));
export const $discount = computed($subtotal, (subtotal) => Math.round(subtotal * PICKUP_DISCOUNT * 100) / 100);
export const $total = computed([$subtotal, $discount], (subtotal, discount) => subtotal - discount);

export function addItem(id: string, qty = 1) {
  const current = $cart.get();
  $cart.set({ ...current, [id]: (current[id] ?? 0) + qty });
}

export function setQty(id: string, qty: number) {
  const { [id]: _removed, ...rest } = $cart.get();
  $cart.set(qty > 0 ? { ...rest, [id]: qty } : rest);
}

export function clearCart() {
  $cart.set({});
}

export function openDrawer(view: DrawerView = 'cart') {
  $drawerView.set(view);
  $drawerOpen.set(true);
}

export function closeDrawer() {
  $drawerOpen.set(false);
  if ($drawerView.get() === 'done') $drawerView.set('cart');
}

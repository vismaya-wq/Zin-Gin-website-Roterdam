/**
 * Submission layer. Both functions currently resolve locally; point them at
 * the reservation system / POS endpoint when the backend exists.
 */
export interface ReservationRequest {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  email: string;
  hotelGuest: boolean;
  roomNumber?: string;
}

export interface PickupOrderRequest {
  lines: { id: string; name: string; qty: number; unitPrice: number }[];
  subtotal: number;
  discount: number;
  total: number;
  name: string;
  phone: string;
  email: string;
  pickupTime: string;
}

export interface SubmitResult {
  ok: boolean;
  reference: string;
}

const API_BASE = import.meta.env.PUBLIC_API_BASE as string | undefined;

async function submit(path: string, payload: unknown): Promise<SubmitResult> {
  if (API_BASE) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  }
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { ok: true, reference: `ZG-${Math.random().toString(36).slice(2, 7).toUpperCase()}` };
}

export const submitReservation = (request: ReservationRequest) => submit('/reservations', request);
export const submitPickupOrder = (request: PickupOrderRequest) => submit('/orders/pickup', request);

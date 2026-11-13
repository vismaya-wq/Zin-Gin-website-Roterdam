/**
 * Submission layer for manager-review workflows. Point `PUBLIC_API_BASE` at your
 * backend when reservations and takeaway requests should reach the team.
 */
import type { SeatingId } from '../data/hotel';

export interface HotelSlotBookingRequest {
  floor: string;
  roomNumber: string;
  date: string;
  time: string;
  guests: number;
  seatingPreference: SeatingId;
  name: string;
  phone: string;
  email?: string;
  specialRequest?: string;
}

export interface PickupOrderRequest {
  lines: { id: string; name: string; qty: number; unitPrice: number }[];
  subtotal: number;
  discount: number;
  total: number;
  name: string;
  phone: string;
  email?: string;
  pickupTime: string;
  specialInstructions?: string;
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

export const submitHotelSlotBooking = (request: HotelSlotBookingRequest) =>
  submit('/bookings/hotel-slot', request);

export const submitPickupOrder = (request: PickupOrderRequest) => submit('/orders/takeaway', request);

import type { NotificationIntent, Reservation } from '../data/ops';
import { SEATING_PREFERENCES } from '../data/hotel';

const seatingLabel = (id: string) => SEATING_PREFERENCES.find((item) => item.id === id)?.label ?? id;

function guestBody(reservation: Reservation) {
  const room = reservation.roomNumber ? `\nRoom: ${reservation.roomNumber}` : '';
  return [
    `Hello ${reservation.name},`,
    '',
    'Your table at Zin & Gin is confirmed.',
    '',
    `Date: ${reservation.date}`,
    `Time: ${reservation.time}`,
    `Guests: ${reservation.guests}`,
    `Seating: ${seatingLabel(reservation.seating)}${room}`,
    '',
    'Zin & Gin · Inside Teleport Hotel · Schiekade 730, Rotterdam',
  ].join('\n');
}

/** Builds messages only. A provider (email or WhatsApp) is not configured, so nothing is delivered. */
export function confirmationIntents(reservation: Reservation, now = new Date().toISOString()): NotificationIntent[] {
  const body = guestBody(reservation);
  const intents: NotificationIntent[] = [];
  if (reservation.email) {
    intents.push({
      id: `ntf-${reservation.id}-email`,
      reservationId: reservation.id,
      channel: 'email',
      status: 'prepared',
      provider: 'unconfigured',
      to: reservation.email,
      subject: 'Your table at Zin & Gin is confirmed',
      body,
      createdAt: now,
    });
  }
  if (reservation.phone) {
    intents.push({
      id: `ntf-${reservation.id}-whatsapp`,
      reservationId: reservation.id,
      channel: 'whatsapp',
      status: 'prepared',
      provider: 'unconfigured',
      to: reservation.phone,
      body,
      createdAt: now,
    });
  }
  return intents;
}

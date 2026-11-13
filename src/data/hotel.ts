export const HOTEL_FLOORS = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Floor 6', 'Floor 7'] as const;

export type DiningSession = 'breakfast' | 'dinner';

export const BREAKFAST_SLOTS = ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30'] as const;
export const DINNER_SLOTS = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'] as const;

/** @deprecated use session slots */
export const SLOT_TIMES = DINNER_SLOTS;

export function slotsForSession(session: DiningSession): readonly string[] {
  return session === 'breakfast' ? BREAKFAST_SLOTS : DINNER_SLOTS;
}

export const SEATING_PREFERENCES = [
  { id: 'main', label: 'Main Dining' },
  { id: 'window', label: 'Window' },
  { id: 'quiet', label: 'Quiet Area' },
  { id: 'group', label: 'Group Seating' },
  { id: 'none', label: 'No Preference' },
] as const;

export type SeatingId = (typeof SEATING_PREFERENCES)[number]['id'];

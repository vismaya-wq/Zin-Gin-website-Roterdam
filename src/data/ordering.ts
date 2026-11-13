import { SITE } from './site';

const POS_URL = SITE.posOrderUrl.trim();
const UBER_URL = SITE.uberEatsUrl;

export const posConfigured = POS_URL.length > 0;
export const uberConfigured = UBER_URL.length > 0;
export const posOrderUrl = POS_URL;
export const bonappioHref = POS_URL || '/order';

/** Takeaway — direct BonAppio handoff. */
export function posEntry() {
  return bonappioHref;
}

export function uberEatsHref() {
  return UBER_URL;
}

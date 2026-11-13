export const CLINIC = {
  name: 'Vitalis Healthcare',
  doctor: 'Dr. Faraaz Patel',
  doctorFormal: 'Dr. Ahmed Faraaz Patel',
  city: 'Kalaburagi',
  phoneDisplay: '84949 06440',
  phoneHref: 'tel:+918494906440',
  phoneAltDisplay: '88840 07440',
  phoneAltHref: 'tel:+918884007440',
  email: 'vitalishealthcaregulbarga@gmail.com',
  address: 'No. 4 & 5, First Floor, A.K. Asian Grand, Main Road, Kalaburagi, Karnataka 585105',
  landmark: 'Opposite KPTCL Office',
  hours: 'Monday to Saturday, 11:00 AM – 3:00 PM and 4:00 PM – 8:00 PM. Friday is a holiday.',
  maps: 'https://www.google.com/maps/search/?api=1&query=Vitalis+Health+Care+AK+Asian+Grand+Kalaburagi',
} as const;

export const CONCERNS = [
  { value: 'diabetic-foot', label: 'Diabetic foot wound' },
  { value: 'not-healing', label: 'Wound not healing' },
  { value: 'recurrent', label: 'Wound that keeps coming back' },
  { value: 'other', label: 'Other wound problem' },
] as const;

export type ConcernValue = (typeof CONCERNS)[number]['value'];
export type ConsultSource = 'hero' | 'situations' | 'diabetic' | 'treats' | 'doctor' | 'faq' | 'final';

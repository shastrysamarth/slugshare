export const UCSC_LOCATIONS = [
  "C9/C10 Dining Hall",
  "Oakes Cafe",
  "Cowell/Stevenson Dining Hall",
  "Crown/Merrill Dining Hall",
  "Porter/Kresge Dining Hall",
  "Other",
] as const;

export type Location = (typeof UCSC_LOCATIONS)[number];


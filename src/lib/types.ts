// Shared domain types used across pages and components.

export type GeoResult = {
  name: string;
  country?: string;
  admin1?: string;
  lat: number;
  lon: number;
};

export type Pin = {
  lat: number;
  lon: number;
  label?: string;
};

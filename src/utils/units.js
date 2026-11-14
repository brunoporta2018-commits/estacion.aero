// Conversiones de unidades.
// Base interna: viento en km/h, altura en metros.

export const WIND_UNITS = [
  { id: 'ms', label: 'm/s', symbol: 'm/s', fromBase: (kph) => kph / 3.6 },
  { id: 'kph', label: 'km/h', symbol: 'km/h', fromBase: (kph) => kph },
  { id: 'mph', label: 'mph', symbol: 'mph', fromBase: (kph) => kph / 1.609344 },
]

export const HEIGHT_UNITS = [
  { id: 'm', label: 'Metros', symbol: 'm', fromBase: (m) => m },
  { id: 'ft', label: 'Pies', symbol: 'ft', fromBase: (m) => m * 3.28084 },
]

// Convierte un valor con su texto original (ej. "9,7 km/h") a km/h
export function windToKph(value, text = '') {
  if (value === null) return null
  if (/m\/s/i.test(text)) return value * 3.6
  if (/mph/i.test(text)) return value * 1.609344
  return value
}

// Convierte un valor con su texto original (ej. "1200 ft") a metros
export function heightToMeters(value, text = '') {
  if (value === null) return null
  if (/\b(ft|pies)\b/i.test(text)) return value / 3.28084
  return value
}

// Cálculos de nubes a partir de datos de superficie.
// Todas las alturas se devuelven en METROS.

// Punto de rocío (°C) con la fórmula de Magnus, por si la API no lo informa.
export function dewPoint(tempC, rh) {
  if (tempC === null || rh === null || rh <= 0) return null
  const a = 17.62
  const b = 243.12
  const g = Math.log(rh / 100) + (a * tempC) / (b + tempC)
  return (b * g) / (a - g)
}

// Base de la capa de nubes (nivel de condensación por ascenso).
// Fórmula de Espy: ~125 m por cada °C de diferencia entre temperatura y punto de rocío.
export const ESPY_M_PER_C = 125

export function cloudBaseMeters(tempC, dewC) {
  if (tempC === null || dewC === null) return null
  return Math.max(0, ESPY_M_PER_C * (tempC - dewC))
}

// Espesor de la capa: ESTIMACIÓN empírica (con datos de superficie no se puede
// medir; haría falta un sondeo o un ceilómetro).
// Se asume que la capa es más gruesa cuanto más húmedo está el aire:
//  - con humedad <= RH_MIN no hay capa significativa (0 m)
//  - crece linealmente hasta THICKNESS_MAX_M con humedad 100 %
export const RH_MIN = 60
export const THICKNESS_MAX_M = 1500

export function cloudThicknessMeters(rh) {
  if (rh === null) return null
  const f = Math.min(1, Math.max(0, (rh - RH_MIN) / (100 - RH_MIN)))
  return f * THICKNESS_MAX_M
}

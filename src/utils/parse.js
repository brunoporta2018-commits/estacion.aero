// "18,1 °C" -> 18.1  |  "67 % " -> 67  |  undefined -> null
export function toNumber(text) {
  if (text === undefined || text === null) return null
  const m = String(text).match(/-?\d+(?:[.,]\d+)?/)
  return m ? parseFloat(m[0].replace(',', '.')) : null
}

// Devuelve el primer campo que exista de una lista de posibles nombres
export function pick(obj, keys) {
  if (!obj) return undefined
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') return obj[k]
  }
  return undefined
}

export function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined) return null
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

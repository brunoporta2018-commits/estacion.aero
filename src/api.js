import axios from 'axios'

// En desarrollo se usa el proxy de Vite (/api -> servidor de la UTN) para evitar CORS.
// En producción se consulta directamente la API (o la URL definida en VITE_API_URL).
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? '/api/apiv2.php'
    : 'https://meteorologia.sanfrancisco.utn.edu.ar/apiv2.php')

const client = axios.create({ timeout: 15000 })

export async function fetchWeather() {
  const { data } = await client.get(API_URL, {
    // Evita respuestas en caché del navegador
    params: { _: Date.now() },
    // La API responde con content-type text/html; se fuerza el parseo a JSON
    transformResponse: [(raw) => (typeof raw === 'string' ? JSON.parse(raw) : raw)],
  })
  return data
}

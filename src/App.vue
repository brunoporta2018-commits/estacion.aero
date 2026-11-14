<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import WeatherCard from './components/WeatherCard.vue'
import { fetchWeather } from './api'
import { pick, toNumber } from './utils/parse'
import { HEIGHT_UNITS, WIND_UNITS, heightToMeters, windToKph } from './utils/units'
import {
  ESPY_M_PER_C,
  RH_MIN,
  cloudBaseMeters,
  cloudThicknessMeters,
  dewPoint,
} from './utils/cloud'

const REFRESH_SECONDS = 7 * 60 // 7 minutos

const data = ref(null)
const error = ref('')
const loading = ref(false)
const remaining = ref(REFRESH_SECONDS)

// Unidad elegida en cada registro
const units = reactive({ wind: 'kph', gust: 'kph', cloudBase: 'm', cloudDepth: 'm' })

let refreshTimer = null
let tickTimer = null

async function load() {
  if (loading.value) return
  loading.value = true
  try {
    data.value = await fetchWeather()
    error.value = ''
  } catch (e) {
    error.value = e?.message || 'error de red'
  } finally {
    loading.value = false
    remaining.value = REFRESH_SECONDS
  }
}

const countdown = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

// --- Valores derivados (siempre en unidad base) ---
const d = computed(() => data.value ?? {})

const temperature = computed(() => toNumber(d.value.temperatura))
const humidity = computed(() => toNumber(d.value.humedad))
const pressure = computed(() => toNumber(d.value.presion))

const windKph = computed(() => windToKph(toNumber(d.value.velocidad_viento), d.value.velocidad_viento))
const gustKph = computed(() =>
  windToKph(toNumber(d.value.velocidad_viento_max), d.value.velocidad_viento_max),
)

// Capa de nubes y espesor: la API no los trae, así que se CALCULAN.
// Si algún día la API los incluye con alguno de estos nombres, tienen prioridad.
const cloudBaseRaw = computed(() =>
  pick(d.value, ['capa_nubes', 'altura_nubes', 'base_nubes', 'altura_capa_nubes', 'nubes']),
)
const cloudDepthRaw = computed(() =>
  pick(d.value, ['espesor_capa', 'espesor_nubes', 'espesor_capa_nubes', 'espesor']),
)

// Punto de rocío: el de la API, o calculado con Magnus si no viene
const dew = computed(() => {
  const fromApi = toNumber(d.value.punto_rocio)
  return fromApi !== null ? fromApi : dewPoint(temperature.value, humidity.value)
})

const cloudBaseApi = computed(() =>
  heightToMeters(toNumber(cloudBaseRaw.value), String(cloudBaseRaw.value ?? '')),
)
const cloudDepthApi = computed(() =>
  heightToMeters(toNumber(cloudDepthRaw.value), String(cloudDepthRaw.value ?? '')),
)

const cloudBase = computed(() =>
  cloudBaseApi.value !== null ? cloudBaseApi.value : cloudBaseMeters(temperature.value, dew.value),
)
const cloudDepth = computed(() =>
  cloudDepthApi.value !== null ? cloudDepthApi.value : cloudThicknessMeters(humidity.value),
)

const cloudBaseExtra = computed(() => {
  if (cloudBase.value === null) return ''
  if (cloudBaseApi.value !== null) return 'Dato de la estación'
  return `Calculado: ${ESPY_M_PER_C} × (T − Td) = ${ESPY_M_PER_C} × (${temperature.value?.toFixed(1)} − ${dew.value?.toFixed(1)})`
})
const cloudDepthExtra = computed(() => {
  if (cloudDepth.value === null) return ''
  if (cloudDepthApi.value !== null) return 'Dato de la estación'
  return cloudDepth.value === 0
    ? `Estimado: sin capa significativa (humedad ≤ ${RH_MIN} %)`
    : `Estimado a partir de la humedad (${humidity.value} %)`
})

const trim = (s) => (s ?? '').toString().trim()

const tempExtra = computed(() =>
  d.value.temperatura_max
    ? `Máx ${trim(d.value.temperatura_max)} (${trim(d.value.hora_temperatura_max)}) · Mín ${trim(d.value.temperatura_min)} (${trim(d.value.hora_temperatura_min)})`
    : '',
)
const humExtra = computed(() =>
  d.value.humedad_max ? `Máx ${trim(d.value.humedad_max)} · Mín ${trim(d.value.humedad_min)}` : '',
)
const presExtra = computed(() =>
  d.value.presion_max ? `Máx ${trim(d.value.presion_max)} · Mín ${trim(d.value.presion_min)}` : '',
)
const windExtra = computed(() =>
  d.value.direccion_viento ? `Dirección: ${trim(d.value.direccion_viento)}` : '',
)
const gustExtra = computed(() =>
  d.value.hora_velocidad_viento_max
    ? `Máxima del día, a las ${trim(d.value.hora_velocidad_viento_max)}`
    : '',
)

onMounted(() => {
  load()
  refreshTimer = setInterval(load, REFRESH_SECONDS * 1000)
  tickTimer = setInterval(() => {
    if (remaining.value > 0) remaining.value--
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(refreshTimer)
  clearInterval(tickTimer)
})
</script>

<template>
  <div class="wrap">
    <header>
      <div>
        <h1>🌤️ Estación Meteorológica</h1>
        <div class="sub">UTN – Facultad Regional San Francisco</div>
      </div>

      <div class="status">
        <div>
          <span class="dot" :class="{ err: !!error }"></span>
          <template v-if="data">Dato del {{ data.fecha }} a las {{ data.hora }}</template>
          <template v-else>Sin datos</template>
        </div>
        <div>Próxima actualización en {{ countdown }}</div>
        <button class="refresh" type="button" :disabled="loading" @click="load">
          {{ loading ? 'Actualizando…' : '↻ Actualizar ahora' }}
        </button>
      </div>
    </header>

    <div v-if="error" class="error">
      No se pudo obtener la información ({{ error }}).
      <template v-if="data">Se muestran los últimos datos disponibles.</template>
    </div>

    <main class="grid">
      <WeatherCard title="Temperatura" icon="🌡️" :value="temperature" fixed-symbol="°C" :extra="tempExtra" />
      <WeatherCard title="Humedad" icon="💧" :value="humidity" fixed-symbol="%" :decimals="0" :extra="humExtra" />
      <WeatherCard title="Presión" icon="🧭" :value="pressure" fixed-symbol="hPa" :extra="presExtra" />

      <WeatherCard
        title="Capa de nubes (base)"
        icon="☁️"
        :value="cloudBase"
        :units="HEIGHT_UNITS"
        v-model:unit="units.cloudBase"
        :decimals="0"
        :extra="cloudBaseExtra"
        missing-text="No hay datos suficientes para calcular"
      />
      <WeatherCard
        title="Espesor de la capa"
        icon="📏"
        :value="cloudDepth"
        :units="HEIGHT_UNITS"
        v-model:unit="units.cloudDepth"
        :decimals="0"
        :extra="cloudDepthExtra"
        missing-text="No hay datos suficientes para estimar"
      />

      <WeatherCard
        title="Viento constante"
        icon="🌬️"
        :value="windKph"
        :units="WIND_UNITS"
        v-model:unit="units.wind"
        :extra="windExtra"
      />
      <WeatherCard
        title="Ráfaga de viento"
        icon="💨"
        :value="gustKph"
        :units="WIND_UNITS"
        v-model:unit="units.gust"
        :extra="gustExtra"
      />
    </main>

    <footer>
      Datos de
      <a href="https://meteorologia.sanfrancisco.utn.edu.ar" target="_blank" rel="noopener">
        meteorologia.sanfrancisco.utn.edu.ar
      </a>
      · Se actualiza automáticamente cada 7 minutos.
    </footer>
  </div>
</template>

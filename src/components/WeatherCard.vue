<script setup>
import { computed } from 'vue'
import { formatNumber } from '../utils/parse'

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  // Valor en la unidad base (km/h, m, °C, %, hPa); null = sin dato
  value: { type: Number, default: null },
  // Unidad fija (para registros sin conversión)
  fixedSymbol: { type: String, default: '' },
  // Lista de unidades seleccionables [{ id, label, symbol, fromBase }]
  units: { type: Array, default: null },
  unit: { type: String, default: '' },
  decimals: { type: Number, default: 1 },
  extra: { type: String, default: '' },
  missingText: { type: String, default: '' },
})

const emit = defineEmits(['update:unit'])

const currentUnit = computed(() => props.units?.find((u) => u.id === props.unit) ?? null)

const display = computed(() => {
  if (props.value === null) return null
  const v = currentUnit.value ? currentUnit.value.fromBase(props.value) : props.value
  return formatNumber(v, props.decimals)
})

const symbol = computed(() => currentUnit.value?.symbol ?? props.fixedSymbol)
</script>

<template>
  <article class="card">
    <h2><span aria-hidden="true">{{ icon }}</span> {{ title }}</h2>

    <div class="value" :class="{ na: display === null }">
      <template v-if="display !== null">
        {{ display }}<small>{{ symbol }}</small>
      </template>
      <template v-else>Sin dato</template>
    </div>

    <div class="extra">{{ display === null ? missingText : extra }}</div>

    <div v-if="units" class="units" role="group" :aria-label="`Unidad de ${title}`">
      <button
        v-for="u in units"
        :key="u.id"
        type="button"
        class="unit-btn"
        :class="{ active: u.id === unit }"
        :aria-pressed="u.id === unit"
        @click="emit('update:unit', u.id)"
      >
        {{ u.label }}
      </button>
    </div>
  </article>
</template>

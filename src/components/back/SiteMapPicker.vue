<script setup lang="ts">
import { osmStaticMapUrl, pixelToLatLng } from '~/utils/site-map'

const props = withDefaults(defineProps<{
  latitude?: number
  longitude?: number
  readOnly?: boolean
}>(), {
  latitude: 39.485,
  longitude: 115.974,
  readOnly: false,
})

const emit = defineEmits<{
  'update:latitude': [number]
  'update:longitude': [number]
}>()

const lat = computed({
  get: () => props.latitude ?? 39.485,
  set: (v: number | null) => emit('update:latitude', Number(v) || 0),
})

const lng = computed({
  get: () => props.longitude ?? 115.974,
  set: (v: number | null) => emit('update:longitude', Number(v) || 0),
})

const mapUrl = computed(() => osmStaticMapUrl(lat.value, lng.value))

function onMapClick(e: MouseEvent) {
  if (props.readOnly)
    return
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const xRatio = (e.clientX - rect.left) / rect.width
  const yRatio = (e.clientY - rect.top) / rect.height
  const next = pixelToLatLng(xRatio, yRatio, lat.value, lng.value)
  emit('update:latitude', next.lat)
  emit('update:longitude', next.lng)
}

function useDefaultCenter() {
  emit('update:latitude', 39.485)
  emit('update:longitude', 115.974)
}
</script>

<template>
  <div class="site-map-picker">
    <p class="mb-2 text-xs text-slate-500">
      {{ readOnly ? '场地位置（经纬度）' : '点击地图标注场地坐标，或在下方输入经纬度' }}
    </p>
    <button
      type="button"
      class="map-preview"
      :class="{ 'map-preview--ro': readOnly }"
      @click="onMapClick"
    >
      <img :src="mapUrl" alt="地图预览" class="h-full w-full object-cover">
      <span v-if="!readOnly" class="map-hint">点击选点</span>
    </button>
    <div class="mt-3 grid grid-cols-2 gap-3">
      <n-form-item label="纬度" label-placement="left" :show-feedback="false" class="!mb-0">
        <n-input-number
          v-model:value="lat"
          class="w-full"
          :step="0.0001"
          :disabled="readOnly"
        />
      </n-form-item>
      <n-form-item label="经度" label-placement="left" :show-feedback="false" class="!mb-0">
        <n-input-number
          v-model:value="lng"
          class="w-full"
          :step="0.0001"
          :disabled="readOnly"
        />
      </n-form-item>
    </div>
    <n-button v-if="!readOnly" class="mt-2" size="small" tertiary @click="useDefaultCenter">
      重置为默认中心（涿州）
    </n-button>
  </div>
</template>

<style scoped>
.site-map-picker {
  width: 100%;
}

.map-preview {
  position: relative;
  display: block;
  width: 100%;
  height: 200px;
  padding: 0;
  overflow: hidden;
  cursor: crosshair;
  background: #e8eef5;
  border: 1px solid #d0d7de;
  border-radius: 4px;
}

.map-preview--ro {
  cursor: default;
}

.map-hint {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 8px;
  font-size: 11px;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 4px;
}
</style>

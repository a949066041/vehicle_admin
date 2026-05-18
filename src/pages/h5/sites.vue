<script setup lang="ts">
import { useSiteStore } from '~/store'
import { tencentMapMarkerUri } from '~/utils/h5-map'

const { dataList } = useSiteStore()

function mapHref(s: (typeof dataList.value)[0]) {
  return tencentMapMarkerUri({
    lat: s.latitude,
    lng: s.longitude,
    title: s.site_name,
    addr: s.site_address,
  })
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="s in dataList"
      :key="s.id"
      class="overflow-hidden rounded-xl bg-white shadow-sm"
    >
      <div class="relative aspect-[2/1] w-full bg-gradient-to-br from-slate-100 to-emerald-50">
        <div class="absolute inset-0 opacity-[0.15]" style="background-image: radial-gradient(circle at 2px 2px, #0f766e 1px, transparent 0); background-size: 18px 18px" />
        <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span class="rounded-md bg-black/55 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
            地图预览
          </span>
          <span class="rounded-md bg-white/90 px-2 py-1 text-[11px] text-slate-700 shadow">
            {{ s.latitude?.toFixed?.(4) }}, {{ s.longitude?.toFixed?.(4) }}
          </span>
        </div>
      </div>
      <div class="p-3.5">
        <div class="text-base font-semibold text-slate-900">
          {{ s.site_name }}
        </div>
        <p class="mt-1 text-sm leading-relaxed text-slate-600">
          {{ s.site_address }}
        </p>
        <p class="mt-1 text-xs text-slate-400">
          容纳约 {{ s.capacity }} 人
        </p>
        <p class="mt-2 text-xs leading-relaxed text-slate-500">
          {{ s.site_intro }}
        </p>
        <a
          :href="mapHref(s)"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 flex h-10 items-center justify-center rounded-lg bg-[#07c160] text-sm font-medium text-white active:opacity-90"
        >
          在腾讯地图中打开
        </a>
      </div>
    </div>
  </div>
</template>

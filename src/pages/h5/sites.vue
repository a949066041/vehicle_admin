<script setup lang="ts">
import { useSiteStore } from '~/store'
import { tencentMapMarkerUri } from '~/utils/h5-map'
import { osmStaticMapUrl } from '~/utils/site-map'

const { dataList, bumpClick } = useSiteStore()

function mapHref(s: (typeof dataList.value)[0]) {
  return tencentMapMarkerUri({
    lat: s.latitude,
    lng: s.longitude,
    title: s.site_name,
    addr: s.site_address,
  })
}

function onOpen(s: (typeof dataList.value)[0]) {
  bumpClick(s.id)
}
</script>

<template>
  <div class="sites-page -mx-2.5 space-y-2">
    <p class="mx-2.5 rounded-lg bg-white px-3 py-2 text-[13px] text-slate-600 shadow-sm">
      练车场地地图可视化，点击卡片可记录浏览次数，支持跳转腾讯地图导航。
    </p>

    <div
      v-for="s in dataList"
      :key="s.id"
      class="site-card overflow-hidden bg-white shadow-sm"
    >
      <div class="relative">
        <img
          :src="osmStaticMapUrl(s.latitude, s.longitude, '640x240')"
          :alt="`${s.site_name}地图`"
          class="h-40 w-full object-cover"
          loading="lazy"
        >
        <span class="absolute left-2 top-2 rounded bg-black/55 px-2 py-0.5 text-[11px] text-white">
          {{ s.site_type || '练车场地' }}
        </span>
        <span class="absolute bottom-2 right-2 rounded bg-white/95 px-2 py-0.5 text-[10px] text-slate-600 shadow">
          {{ s.latitude?.toFixed(4) }}, {{ s.longitude?.toFixed(4) }}
        </span>
      </div>
      <div class="p-3.5" @click="onOpen(s)">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <div class="text-[16px] font-semibold text-slate-900">
              {{ s.site_name }}
            </div>
            <p class="mt-1 text-[13px] text-slate-600">
              {{ s.site_scale }} · 容纳约 {{ s.capacity }} 人
            </p>
          </div>
          <img
            v-if="s.site_photo"
            :src="s.site_photo"
            alt=""
            class="h-14 w-20 shrink-0 rounded object-cover border border-slate-100"
          >
        </div>
        <p class="mt-2 text-[13px] leading-relaxed text-slate-600">
          {{ s.site_address }}
        </p>
        <p v-if="s.site_intro" class="mt-1 text-xs leading-relaxed text-slate-500">
          {{ s.site_intro }}
        </p>
        <div class="mt-2 flex gap-3 text-[11px] text-slate-400">
          <span>浏览 {{ s.click_num ?? 0 }}</span>
          <span>评论 {{ s.comment_num ?? 0 }}</span>
          <span>收藏 {{ s.favorite_num ?? 0 }}</span>
        </div>
        <a
          :href="mapHref(s)"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 flex h-10 items-center justify-center rounded-lg bg-[#07c160] text-sm font-medium text-white active:opacity-90"
          @click.stop
        >
          在腾讯地图中打开
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.site-card {
  border-bottom: 1px solid #eee;
}
</style>

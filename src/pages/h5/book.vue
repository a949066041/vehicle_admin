<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useLoginStore, usePracticeBookingStore, useSiteStore, useTrainingProjectStore } from '~/store'

const message = useMessage()
const { currentProfile } = useLoginStore()
const { dataList: projects } = useTrainingProjectStore()
const { dataList: sites } = useSiteStore()
const { submitBooking } = usePracticeBookingStore()

const remark = ref('')

function siteName(id: number) {
  return sites.value.find(s => s.id === id)?.site_name ?? '-'
}

const bookable = computed(() => projects.value.filter(p => p.status === '可预约' && p.booked_num < p.max_num))
const fullOrClosed = computed(() =>
  projects.value.filter(p => p.status !== '可预约' || p.booked_num >= p.max_num),
)

function book(p: (typeof projects.value)[0]) {
  const sid = currentProfile.value?.id
  if (sid == null) {
    message.error('请先登录')
    return
  }
  const res = submitBooking({
    student_id: sid,
    project_id: p.id,
    coach_id: p.coach_id,
    remark: remark.value,
  })
  if (!res.ok) {
    message.error(res.message)
    return
  }
  message.success(res.message)
  remark.value = ''
}
</script>

<template>
  <div class="space-y-3">
    <n-input v-model:value="remark" type="textarea" placeholder="备注（可选）" :rows="2" class="rounded-xl" />

    <div class="flex items-center justify-between px-1">
      <h2 class="text-[15px] font-semibold text-slate-900">
        可预约
      </h2>
      <span class="text-xs text-slate-400">{{ bookable.length }} 项</span>
    </div>
    <div
      v-for="p in bookable"
      :key="p.id"
      class="rounded-xl border border-emerald-100 bg-white p-3.5 shadow-sm"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="text-[15px] font-medium text-slate-900">
            {{ p.project_name }}
          </div>
          <div class="mt-1.5 space-y-0.5 text-[13px] text-slate-600">
            <div>{{ p.subject }} · {{ p.car_type }}</div>
            <div>{{ p.train_date }} {{ p.train_time }}</div>
            <div class="truncate">
              {{ siteName(p.site_id) }}
            </div>
          </div>
        </div>
        <span class="shrink-0 rounded bg-[#07c160]/10 px-2 py-0.5 text-[11px] font-medium text-[#07c160]">
          可约
        </span>
      </div>
      <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>名额 {{ p.booked_num }}/{{ p.max_num }}</span>
      </div>
      <n-button class="mt-3 w-full" type="primary" @click="book(p)">
        立即预约
      </n-button>
    </div>
    <n-empty v-if="!bookable.length" description="暂无可预约时段" />

    <n-divider class="!text-xs text-slate-400">
      已满或不可选
    </n-divider>
    <div
      v-for="p in fullOrClosed"
      :key="`x-${p.id}`"
      class="rounded-xl border border-slate-100 bg-slate-50/80 p-3 opacity-90"
    >
      <div class="flex justify-between gap-2">
        <span class="text-sm font-medium text-slate-600">{{ p.project_name }}</span>
        <span class="shrink-0 text-xs text-slate-400">
          {{ p.booked_num >= p.max_num ? '名额已满' : p.status }}
        </span>
      </div>
      <p class="mt-1 text-xs text-slate-400">
        {{ p.train_date }} {{ p.train_time }}
      </p>
    </div>
  </div>
</template>

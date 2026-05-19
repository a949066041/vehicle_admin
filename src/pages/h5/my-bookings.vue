<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  useCancelBookingStore,
  useLoginStore,
  usePracticeBookingStore,
  useSiteStore,
  useTrainingProjectStore,
} from '~/store'
import { auditStatusLabel, subjectShort } from '~/utils/h5-booking'

const { currentProfile } = useLoginStore()
const { list: bookings } = usePracticeBookingStore()
const { dataList: projects } = useTrainingProjectStore()
const { dataList: sites } = useSiteStore()
const { cancelForAppoint } = useCancelBookingStore()

const mine = computed(() => {
  const sid = currentProfile.value?.id
  if (sid == null)
    return []
  return [...bookings.value].filter(b => b.student_id === sid).sort((a, b) => b.id - a.id)
})

function projectOf(pid: number) {
  return projects.value.find(p => p.id === pid)
}

function venueLabel(siteId: number) {
  const site = sites.value.find(s => s.id === siteId)
  if (!site)
    return '—'
  const m = site.site_address.match(/[\u4e00-\u9fa5]{2,6}(路|街|大道)/)
  return m?.[0] ?? site.site_name
}

function statusText(b: (typeof bookings.value)[0]) {
  const cancel = cancelForAppoint(b.id)
  if (cancel)
    return `取消${auditStatusLabel(cancel.status)}`
  return auditStatusLabel(b.status)
}
</script>

<template>
  <div class="bookings-page -mx-2.5 space-y-2">
    <p class="mx-2.5 rounded-lg bg-white px-3 py-2 text-[13px] text-slate-600 shadow-sm">
      练车预约记录，点击进入详情；可提交取消申请并查看审核结果。
    </p>

    <RouterLink
      v-for="b in mine"
      :key="b.id"
      :to="`/h5/booking/${b.id}`"
      class="info-card block overflow-hidden active:opacity-90"
    >
      <div class="info-row">
        <span class="info-label">练车科目</span>
        <span class="info-value">
          {{ projectOf(b.project_id) ? subjectShort(projectOf(b.project_id)!.subject) : '—' }}
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">练车日期</span>
        <span class="info-value">{{ b.appoint_date }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">练车场地</span>
        <span class="info-value">
          {{ projectOf(b.project_id) ? venueLabel(projectOf(b.project_id)!.site_id) : '—' }}
        </span>
      </div>
      <div class="info-row !border-b-0">
        <span class="info-label">状态</span>
        <span class="info-value">{{ statusText(b) }}</span>
      </div>
    </RouterLink>

    <n-empty v-if="!mine.length" class="!py-12" description="暂无预约记录" />
  </div>
</template>

<style scoped>
.bookings-page {
  font-size: 15px;
  color: #333;
  padding-bottom: 8px;
}

.info-card {
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 10px 14px;
  border-bottom: 1px solid #eee;
}

.info-label {
  flex-shrink: 0;
  width: 5.5em;
  font-size: 15px;
  color: #333;
}

.info-value {
  flex: 1;
  text-align: right;
  font-size: 15px;
  color: #666;
}
</style>

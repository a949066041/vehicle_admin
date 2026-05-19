<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import {
  useCancelBookingStore,
  useCoachStore,
  useLoginStore,
  usePracticeBookingStore,
  useSiteStore,
  useStudentStore,
  useTrainingProjectStore,
} from '~/store'
import { auditStatusLabel, coachWorkNo, subjectShort } from '~/utils/h5-booking'

const BANNER = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=320&fit=crop'

const message = useMessage()
const route = useRoute()
const router = useRouter()
const { currentProfile } = useLoginStore()
const { dataList: students } = useStudentStore()
const { dataList: coaches } = useCoachStore()
const { dataList: sites } = useSiteStore()
const { list: bookings } = usePracticeBookingStore()
const { dataList: projects } = useTrainingProjectStore()
const { submitCancel, cancelForAppoint } = useCancelBookingStore()

const bookingId = computed(() => Number(route.params.id))
const showCancelModal = ref(false)
const cancelReason = ref('')

const booking = computed(() => bookings.value.find(b => b.id === bookingId.value))

const cancelRow = computed(() =>
  booking.value ? cancelForAppoint(booking.value.id) : null,
)

const project = computed(() =>
  booking.value ? projects.value.find(p => p.id === booking.value!.project_id) : null,
)

const site = computed(() =>
  project.value ? sites.value.find(s => s.id === project.value!.site_id) : null,
)

const coach = computed(() =>
  booking.value ? coaches.value.find(c => c.id === booking.value!.coach_id) : null,
)

const meStudent = computed(() => {
  const sid = currentProfile.value?.id
  if (sid == null)
    return null
  return students.value.find(s => s.id === sid) ?? null
})

const isMine = computed(() =>
  booking.value != null && booking.value.student_id === currentProfile.value?.id,
)

const canApplyCancel = computed(() => {
  if (!booking.value || cancelRow.value)
    return false
  return booking.value.status === '已通过' || booking.value.status === '待审核'
})

const venueLabel = computed(() => {
  if (!site.value)
    return '—'
  const addr = site.value.site_address
  const m = addr.match(/[\u4e00-\u9fa5]{2,6}(路|街|大道)/)
  return m?.[0] ?? site.value.site_name
})

function openCancel() {
  cancelReason.value = ''
  showCancelModal.value = true
}

function confirmCancel() {
  const sid = currentProfile.value?.id
  if (sid == null || !booking.value) {
    message.error('登录已失效')
    return
  }
  if (!cancelReason.value.trim()) {
    message.warning('请填写取消原因')
    return
  }
  const res = submitCancel({
    appoint_id: booking.value.id,
    student_id: sid,
    cancel_reason: cancelReason.value.trim(),
  })
  if (!res.ok) {
    message.warning(res.message ?? '提交失败')
    return
  }
  showCancelModal.value = false
  message.success(res.message ?? '已提交')
}

function goReview() {
  router.push('/h5/review')
}

function auditStatus() {
  if (cancelRow.value)
    return auditStatusLabel(cancelRow.value.status)
  if (booking.value)
    return auditStatusLabel(booking.value.status)
  return '—'
}

function auditReply() {
  if (cancelRow.value?.check_remark?.trim())
    return cancelRow.value.check_remark
  return '—'
}
</script>

<template>
  <div v-if="booking && isMine" class="booking-page -mx-2.5 space-y-2">
    <!-- 已提交取消：设计图右屏 -->
    <section v-if="cancelRow" class="info-card overflow-hidden">
      <img :src="BANNER" alt="" class="h-36 w-full object-cover">
      <div class="info-row">
        <span class="info-label">练车科目</span>
        <span class="info-value">{{ project ? subjectShort(project.subject) : '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">练车车型</span>
        <span class="info-value">{{ project?.car_type ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">练车场地</span>
        <span class="info-value">{{ venueLabel }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">练车时间</span>
        <span class="info-value">{{ project?.train_time ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">练车日期</span>
        <span class="info-value">{{ booking.appoint_date }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">取消原因</span>
        <span class="info-value">{{ cancelRow.cancel_reason }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">教练工号</span>
        <span class="info-value">{{ coach ? coachWorkNo(coach.username ?? '', coach.id) : '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">教练姓名</span>
        <span class="info-value">{{ coach?.name ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">学员账号</span>
        <span class="info-value">{{ meStudent?.username ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">学员姓名</span>
        <span class="info-value">{{ meStudent?.name ?? currentProfile?.displayName ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">审核状态</span>
        <span class="info-value">{{ auditStatus() }}</span>
      </div>
      <div class="info-row !border-b-0">
        <span class="info-label">审核回复</span>
        <span class="info-value">{{ auditReply() }}</span>
      </div>
    </section>

    <!-- 预约详情：设计图左屏 -->
    <section v-else class="info-card overflow-hidden">
      <div class="info-row">
        <span class="info-label">练车科目</span>
        <span class="info-value">{{ project ? subjectShort(project.subject) : '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">练车车型</span>
        <span class="info-value">{{ project?.car_type ?? meStudent?.car_type ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">练车场地</span>
        <span class="info-value">{{ venueLabel }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">练车时间</span>
        <span class="info-value">{{ project?.train_time ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">练车日期</span>
        <span class="info-value">{{ booking.appoint_date }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">预约说明</span>
        <span class="info-value">{{ booking.remark?.trim() || '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">教练工号</span>
        <span class="info-value">{{ coach ? coachWorkNo(coach.username ?? '', coach.id) : '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">教练姓名</span>
        <span class="info-value">{{ coach?.name ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">学员账号</span>
        <span class="info-value">{{ meStudent?.username ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">学员姓名</span>
        <span class="info-value">{{ meStudent?.name ?? currentProfile?.displayName ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">审核状态</span>
        <span class="info-value">{{ auditStatus() }}</span>
      </div>
      <div class="info-row !border-b-0">
        <span class="info-label">审核回复</span>
        <span class="info-value">{{ auditReply() }}</span>
      </div>
      <div class="info-footer-btns">
        <button
          type="button"
          class="info-action-btn"
          :disabled="!canApplyCancel"
          @click="openCancel"
        >
          取消预约
        </button>
        <button type="button" class="info-action-btn" @click="goReview">
          学员评价
        </button>
      </div>
    </section>

    <n-modal
      v-model:show="showCancelModal"
      preset="card"
      title="取消预约"
      class="max-w-[92vw]"
      :style="{ width: '340px' }"
      :bordered="false"
    >
      <p class="mb-2 text-sm text-slate-500">
        请填写取消原因，提交后等候管理员或教练审核。
      </p>
      <n-input
        v-model:value="cancelReason"
        type="textarea"
        placeholder="如：约错了、时间冲突等"
        :rows="3"
      />
      <template #footer>
        <n-button type="primary" block @click="confirmCancel">
          提交申请
        </n-button>
      </template>
    </n-modal>
  </div>

  <n-empty v-else class="!mt-8" description="预约不存在或无权查看" />
</template>

<style scoped>
.booking-page {
  font-size: 15px;
  color: #333;
  padding-bottom: 12px;
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
  min-height: 48px;
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
  word-break: break-all;
}

.info-footer-btns {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-top: 1px solid #eee;
}

.info-action-btn {
  flex: 1;
  height: 40px;
  font-size: 15px;
  color: #fff;
  background: #4a9ff5;
  border: none;
  border-radius: 4px;
}

.info-action-btn:disabled {
  opacity: 0.45;
}

.info-action-btn:active:not(:disabled) {
  opacity: 0.88;
}
</style>

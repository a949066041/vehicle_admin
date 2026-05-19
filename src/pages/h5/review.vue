<script setup lang="ts">
import type { DrivingReview } from '~/types/driving-school'
import dayjs from 'dayjs'
import { useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import {
  useCoachStore,
  useDrivingReviewStore,
  useLoginStore,
  usePracticeBookingStore,
  useSiteStore,
  useStudentStore,
  useTrainingProjectStore,
} from '~/store'

const message = useMessage()
const router = useRouter()
const route = useRoute()
const { currentProfile } = useLoginStore()
const { dataList: students } = useStudentStore()
const { dataList: coaches } = useCoachStore()
const { dataList: sites } = useSiteStore()
const { list: bookings } = usePracticeBookingStore()
const { dataList: projects } = useTrainingProjectStore()
const { list, upsertStudentReview, updateCoachFeedback } = useDrivingReviewStore()

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1590674899484-d5640e5c7113?w=800&h=320&fit=crop'
const DEFAULT_PRACTICE_PHOTO = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&h=200&fit=crop'

const coachId = ref<number | null>(coaches.value[0]?.id ?? null)
const serviceStar = ref(5)
const attitudeStar = ref(5)
const comment = ref('')
const showReply = ref(false)
const replyDraft = ref('')

const meStudent = computed(() => {
  const id = currentProfile.value?.id
  if (id == null)
    return null
  return students.value.find(s => s.id === id) ?? null
})

const existing = computed(() => {
  const sid = currentProfile.value?.id
  if (sid == null || coachId.value == null)
    return null
  return list.value.find(r => r.student_id === sid && r.coach_id === coachId.value) ?? null
})

const coach = computed(() => coaches.value.find(c => c.id === coachId.value))

const practiceContext = computed(() => {
  const sid = currentProfile.value?.id
  const cid = coachId.value
  if (sid == null || cid == null)
    return { subject: '科二', photo: DEFAULT_PRACTICE_PHOTO, banner: DEFAULT_BANNER }
  const booking = [...bookings.value]
    .filter(b => b.student_id === sid && b.coach_id === cid)
    .sort((a, b) => b.id - a.id)[0]
  const project = booking
    ? projects.value.find(p => p.id === booking.project_id)
    : projects.value.find(p => p.coach_id === cid)
  const site = project ? sites.value.find(s => s.id === project.site_id) : sites.value[0]
  const subject = project?.subject
    ? project.subject.replace(/^科目/, '')
    : '科二'
  return {
    subject,
    photo: site?.site_photo || DEFAULT_PRACTICE_PHOTO,
    banner: site?.site_photo || DEFAULT_BANNER,
  }
})

const carType = computed(() => meStudent.value?.car_type ?? 'C1')

function workNo(username: string, fallbackId: number) {
  const digits = username.replace(/\D/g, '')
  if (digits)
    return digits.padStart(3, '0').slice(-3)
  return String(fallbackId).padStart(3, '0')
}

function displayTime(r: DrivingReview | null) {
  return r?.addtime ?? dayjs().format('YYYY-MM-DD HH:mm:ss')
}

function svcStar(r: DrivingReview) {
  return r.student_service_star ?? r.student_star
}

function attStar(r: DrivingReview) {
  return r.student_attitude_star ?? r.student_star
}

function progStar(r: DrivingReview) {
  return r.coach_progress_star ?? r.coach_star
}

function coachAttStar(r: DrivingReview) {
  return r.coach_attitude_star ?? r.coach_star
}

function subjectOf(r: DrivingReview) {
  return r.subject ?? practiceContext.value.subject
}

function photoOf(r: DrivingReview) {
  return r.practice_photo || practiceContext.value.photo
}

const hasCoachReview = computed(() => {
  const r = existing.value
  return !!r && (r.coach_star > 0 || !!r.coach_comment?.trim())
})

function submit() {
  const sid = currentProfile.value?.id
  if (sid == null) {
    message.error('登录已失效，请重新登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (coachId.value == null) {
    message.error('请选择教练')
    return
  }
  upsertStudentReview({
    student_id: sid,
    coach_id: coachId.value,
    student_star: serviceStar.value,
    student_service_star: serviceStar.value,
    student_attitude_star: attitudeStar.value,
    student_comment: comment.value.trim() || '满意',
    subject: practiceContext.value.subject,
    practice_photo: practiceContext.value.photo,
  })
  message.success('评价已提交')
}

function openReply() {
  replyDraft.value = existing.value?.student_reply ?? ''
  showReply.value = true
}

function saveReply() {
  const r = existing.value
  if (!r)
    return
  const text = replyDraft.value.trim()
  if (!text) {
    message.warning('请输入回复内容')
    return
  }
  updateCoachFeedback(r.id, { student_reply: text })
  showReply.value = false
  message.success('回复已保存')
}

watch(existing, (r) => {
  if (!r)
    return
  serviceStar.value = svcStar(r)
  attitudeStar.value = attStar(r)
  comment.value = r.student_comment
}, { immediate: true })
</script>

<template>
  <div class="review-page -mx-2.5 space-y-2">
    <!-- 选择教练 -->
    <section class="review-card overflow-hidden">
      <div class="review-row">
        <span class="review-label">选择教练</span>
        <n-select
          v-model:value="coachId"
          class="review-select"
          size="small"
          :bordered="false"
          :options="coaches.map(c => ({ label: c.name, value: c.id }))"
          placeholder="请选择"
        />
      </div>
    </section>

    <!-- 学员对教练的评价：提交表单 -->
    <section v-if="!existing?.student_comment?.trim()" class="review-card overflow-hidden">
      <div class="review-section-title">
        评价教练
      </div>
      <div class="review-row">
        <span class="review-label">练车科目</span>
        <span class="review-value">{{ practiceContext.subject }}</span>
      </div>
      <div class="review-row">
        <span class="review-label">练车车型</span>
        <span class="review-value">{{ carType }}</span>
      </div>
      <div class="review-row">
        <span class="review-label">练车图片</span>
        <img
          :src="practiceContext.photo"
          alt=""
          class="h-11 w-11 rounded-full border border-[#eee] object-cover"
        >
      </div>
      <div class="review-row items-center">
        <span class="review-label">服务质量</span>
        <n-rate v-model:value="serviceStar" color="#4a9ff5" />
      </div>
      <div class="review-row items-center">
        <span class="review-label">服务态度</span>
        <n-rate v-model:value="attitudeStar" color="#4a9ff5" />
      </div>
      <div class="review-row !items-start">
        <span class="review-label pt-2">评价建议</span>
        <n-input
          v-model:value="comment"
          type="textarea"
          class="review-textarea"
          placeholder="请输入评价内容"
          :rows="3"
          :bordered="false"
        />
      </div>
      <div class="px-3 py-3">
        <n-button type="primary" block class="review-submit" @click="submit">
          提交评价
        </n-button>
      </div>
    </section>

    <!-- 学员对教练的评价：详情（设计图左屏） -->
    <section v-else class="review-card overflow-hidden">
      <div class="review-row">
        <span class="review-label">练车科目</span>
        <span class="review-value">{{ subjectOf(existing) }}</span>
      </div>
      <div class="review-row">
        <span class="review-label">练车车型</span>
        <span class="review-value">{{ carType }}</span>
      </div>
      <div class="review-row">
        <span class="review-label">练车图片</span>
        <img
          :src="photoOf(existing)"
          alt=""
          class="h-11 w-11 rounded-full border border-[#eee] object-cover"
        >
      </div>
      <div class="review-row items-center">
        <span class="review-label">服务质量</span>
        <n-rate :value="svcStar(existing)" readonly color="#4a9ff5" />
      </div>
      <div class="review-row items-center">
        <span class="review-label">服务态度</span>
        <n-rate :value="attStar(existing)" readonly color="#4a9ff5" />
      </div>
      <div class="review-row">
        <span class="review-label">评价时间</span>
        <span class="review-value">{{ displayTime(existing) }}</span>
      </div>
      <div class="review-row">
        <span class="review-label">教练工号</span>
        <span class="review-value">{{ coach ? workNo(coach.username ?? '', coach.id) : '—' }}</span>
      </div>
      <div class="review-row">
        <span class="review-label">教练姓名</span>
        <span class="review-value">{{ coach?.name ?? '—' }}</span>
      </div>
      <div class="review-comment-block">
        <div class="mb-1 text-[15px] text-[#333]">
          评价建议
        </div>
        <p class="review-comment-text">
          {{ existing.student_comment }}
        </p>
      </div>
    </section>

    <!-- 教练对学员的评价（设计图右屏） -->
    <section v-if="hasCoachReview && existing" class="review-card coach-review overflow-hidden">
      <img
        :src="practiceContext.banner"
        alt=""
        class="h-36 w-full object-cover"
      >
      <div class="review-row">
        <span class="review-label">练车科目</span>
        <span class="review-value">{{ subjectOf(existing) }}</span>
      </div>
      <div class="review-row">
        <span class="review-label">练车车型</span>
        <span class="review-value">{{ carType }}</span>
      </div>
      <div class="review-row items-center">
        <span class="review-label">学习成果</span>
        <n-rate :value="progStar(existing)" readonly />
      </div>
      <div class="review-row items-center">
        <span class="review-label">学习态度</span>
        <n-rate :value="coachAttStar(existing)" readonly />
      </div>
      <div class="review-row">
        <span class="review-label">评价时间</span>
        <span class="review-value">{{ displayTime(existing) }}</span>
      </div>
      <div class="review-row">
        <span class="review-label">学员账号</span>
        <span class="review-value">{{ meStudent?.username ?? '—' }}</span>
      </div>
      <div class="review-row">
        <span class="review-label">学员姓名</span>
        <span class="review-value">{{ meStudent?.name ?? currentProfile?.displayName ?? '—' }}</span>
      </div>
      <div class="review-row">
        <span class="review-label">教练工号</span>
        <span class="review-value">{{ coach ? workNo(coach.username ?? '', coach.id) : '—' }}</span>
      </div>
      <div class="review-row">
        <span class="review-label">教练姓名</span>
        <span class="review-value">{{ coach?.name ?? '—' }}</span>
      </div>
      <div class="review-row !items-start">
        <span class="review-label">评价建议</span>
        <span class="review-value text-left leading-relaxed">{{ existing.coach_comment }}</span>
      </div>
      <div v-if="existing.student_reply" class="review-row !items-start">
        <span class="review-label">回复内容</span>
        <span class="review-value text-left leading-relaxed">{{ existing.student_reply }}</span>
      </div>
      <div class="flex items-center gap-3 px-3 py-3">
        <button type="button" class="review-reply-btn" @click="openReply">
          回复
        </button>
      </div>
    </section>

    <n-empty
      v-if="existing && !hasCoachReview"
      class="!rounded-xl !bg-white !py-8 shadow-sm"
      description="教练尚未评价，请耐心等待"
    />

    <n-modal
      v-model:show="showReply"
      preset="card"
      title="回复教练"
      class="max-w-[92vw]"
      :style="{ width: '340px' }"
      :bordered="false"
    >
      <n-input
        v-model:value="replyDraft"
        type="textarea"
        placeholder="请输入回复内容"
        :rows="3"
      />
      <template #footer>
        <n-button type="primary" block @click="saveReply">
          确定
        </n-button>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.review-page {
  font-size: 15px;
  color: #333;
}

.review-card {
  background: #fff;
  border-radius: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.coach-review :deep(.n-rate .n-rate__item .n-rate__item__icon) {
  color: #333 !important;
}

.review-section-title {
  padding: 12px 14px 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  border-bottom: 1px solid #eee;
}

.review-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding: 10px 14px;
  border-bottom: 1px solid #eee;
}

.review-label {
  flex-shrink: 0;
  width: 5.5em;
  font-size: 15px;
  color: #333;
}

.review-value {
  flex: 1;
  text-align: right;
  font-size: 15px;
  color: #666;
  word-break: break-all;
}

.review-comment-block {
  padding: 14px;
  border-bottom: 1px solid #eee;
}

.review-comment-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.review-select {
  flex: 1;
  max-width: 200px;
}

.review-select :deep(.n-base-selection) {
  --n-border: none !important;
  --n-box-shadow: none !important;
  background: transparent !important;
}

.review-select :deep(.n-base-selection-label) {
  justify-content: flex-end;
}

.review-textarea {
  flex: 1;
}

.review-textarea :deep(.n-input__textarea-el) {
  text-align: right;
  font-size: 15px;
}

.review-submit {
  height: 44px;
  font-size: 16px;
  border-radius: 4px;
}

.review-reply-btn {
  min-width: 72px;
  padding: 6px 20px;
  font-size: 14px;
  color: #4a9ff5;
  background: #e8f3ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
}

.review-reply-btn:active {
  opacity: 0.85;
}
</style>

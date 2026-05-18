<script setup lang="ts">
import dayjs from 'dayjs'
import { useMessage } from 'naive-ui'
import {
  useCoachStore,
  useExamApplyStore,
  useExamInfoStore,
  useLoginStore,
  usePracticeBookingStore,
  useStudentStore,
} from '~/store'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const { currentProfile } = useLoginStore()
const { dataList: students } = useStudentStore()
const { dataList: exams } = useExamInfoStore()
const { list: bookings } = usePracticeBookingStore()
const { dataList: coaches } = useCoachStore()
const { applyExam } = useExamApplyStore()

const remark = ref('')
const submitAt = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))

const examId = computed(() => Number(route.query.examId || 0))
const studentId = computed(() => Number(currentProfile.value?.id || 0))

const exam = computed(() => exams.value.find(e => e.id === examId.value) ?? null)
const student = computed(() => students.value.find(s => s.id === studentId.value) ?? null)

const latestPassedBooking = computed(() => {
  if (!studentId.value)
    return null
  return [...bookings.value]
    .filter(b => b.student_id === studentId.value && b.status === '已通过')
    .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))[0] ?? null
})

const coach = computed(() => {
  const coachId = latestPassedBooking.value?.coach_id
  if (coachId == null)
    return null
  return coaches.value.find(c => c.id === coachId) ?? null
})

const studentAccountNo = computed(() => {
  if (!studentId.value)
    return '-'
  return String(202500 + studentId.value)
})

function toMonthDay(dateText: string | undefined) {
  if (!dateText)
    return '-'
  const d = dayjs(dateText)
  if (!d.isValid())
    return dateText
  return d.format('M月D日')
}

function submitApply() {
  if (!studentId.value) {
    message.error('请先登录')
    return
  }
  if (!exam.value) {
    message.error('考试信息不存在')
    return
  }
  const res = applyExam({ student_id: studentId.value, exam_id: examId.value })
  if (!res.ok) {
    message.error(res.message)
    return
  }
  const applyId = res.apply?.id
  if (!applyId) {
    message.success('提交成功')
    router.push('/h5/exam')
    return
  }
  router.replace({ path: '/h5/exam-success', query: { applyId: String(applyId) } })
}
</script>

<template>
  <div class="space-y-3">
    <n-card title="考试申请确认" size="small" embedded class="!rounded-xl">
      <div class="space-y-0">
        <div class="row">
          <span class="label">考试时间</span>
          <span class="value">{{ toMonthDay(exam?.exam_date) }}</span>
        </div>
        <div class="row">
          <span class="label">预约人数</span>
          <span class="value">1</span>
        </div>
        <div class="row">
          <span class="label">申请时间</span>
          <span class="value">{{ submitAt }}</span>
        </div>
        <div class="row">
          <span class="label">申请说明</span>
          <n-input
            v-model:value="remark"
            class="flex-1"
            size="small"
            placeholder="申请说明"
            maxlength="60"
            show-count
          />
        </div>
        <div class="row">
          <span class="label">教练工号</span>
          <span class="value">{{ coach?.username || '-' }}</span>
        </div>
        <div class="row">
          <span class="label">教练姓名</span>
          <span class="value">{{ coach?.name || '-' }}</span>
        </div>
        <div class="row">
          <span class="label">学员账号</span>
          <span class="value">{{ studentAccountNo }}</span>
        </div>
        <div class="row border-none">
          <span class="label">学员姓名</span>
          <span class="value">{{ student?.name || currentProfile?.displayName || '-' }}</span>
        </div>
      </div>
    </n-card>

    <div class="grid grid-cols-2 gap-2">
      <n-button secondary @click="router.back()">
        返回
      </n-button>
      <n-button type="primary" @click="submitApply">
        确认提交
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.6rem;
  padding: 0.6rem 0.1rem;
  border-bottom: 1px solid #f1f5f9;
}

.label {
  width: 4.6rem;
  color: #64748b;
  font-size: 0.82rem;
  flex-shrink: 0;
}

.value {
  color: #0f172a;
  font-size: 0.86rem;
}
</style>

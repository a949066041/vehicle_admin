<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useExamApplyStore, useExamInfoStore, useLoginStore } from '~/store'

const message = useMessage()
const { dataList: exams } = useExamInfoStore()
const { list: applies } = useExamApplyStore()
const { currentProfile } = useLoginStore()
const router = useRouter()

function apply(eid: number | undefined) {
  if (eid == null) {
    message.error('考试信息异常，请刷新后重试')
    return
  }
  const sid = currentProfile.value?.id
  if (sid == null) {
    message.error('请先登录')
    return
  }
  router.push({ path: '/h5/exam-confirm', query: { examId: String(eid) } })
}

const myApplies = computed(() => {
  const sid = currentProfile.value?.id
  if (sid == null)
    return []
  return [...applies.value]
    .filter(a => a.student_id === sid)
    .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))
})

function appliedFor(eid: number | undefined) {
  if (eid == null)
    return null
  return myApplies.value.find(a => a.exam_id === eid && (a.status === '待审核' || a.status === '已通过'))
}

function seatsLeft(e: (typeof exams.value)[0]) {
  return Math.max(0, Number(e.max_num ?? 0) - Number(e.booked_num ?? 0))
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="e in exams"
      :key="e.id"
      class="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="text-[15px] font-semibold text-slate-900">
            {{ e.exam_name }}
          </div>
          <div class="mt-1 space-y-0.5 text-[13px] text-slate-600">
            <div>{{ e.exam_subject }} · {{ e.exam_type }}</div>
            <div class="truncate">
              {{ e.exam_date }} {{ e.exam_address }}
            </div>
          </div>
        </div>
        <span
          class="shrink-0 rounded px-2 py-0.5 text-[11px] font-medium"
          :class="e.status === '可预约' && seatsLeft(e) > 0 ? 'bg-[#07c160]/12 text-[#07c160]' : 'bg-slate-100 text-slate-400'"
        >
          {{ e.status }}
        </span>
      </div>
      <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>已约 {{ e.booked_num }} / {{ e.max_num }}</span>
        <span v-if="seatsLeft(e) <= 3 && seatsLeft(e) > 0" class="text-amber-600">余量紧张</span>
      </div>
      <n-button
        class="mt-3 w-full"
        type="primary"
        :disabled="e.status !== '可预约' || seatsLeft(e) <= 0 || !!appliedFor(e.id)"
        @click="apply(e.id)"
      >
        {{ appliedFor(e.id) ? '已申请' : seatsLeft(e) <= 0 ? '名额已满' : '申请考试' }}
      </n-button>
      <p v-if="appliedFor(e.id)" class="mt-2 text-center text-[11px] text-slate-400">
        当前申请状态：{{ appliedFor(e.id)!.status }}
      </p>
    </div>

    <n-divider class="!text-xs">
      我的考试申请
    </n-divider>
    <div v-for="a in myApplies" :key="a.id" class="mb-2 flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-sm shadow-sm">
      <span class="text-slate-800">考试 #{{ a.exam_id }}</span>
      <n-tag size="small" :type="a.status === '已通过' ? 'success' : a.status === '已驳回' ? 'error' : 'warning'">
        <span>{{ a.status }}</span>
      </n-tag>
    </div>
    <n-empty v-if="!myApplies.length" description="暂无申请记录" />
  </div>
</template>

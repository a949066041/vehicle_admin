<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { RouterLink, useRouter } from 'vue-router'
import {
  useCancelBookingStore,
  useContactMessageStore,
  useDrivingReviewStore,
  useLoginStore,
  usePracticeBookingStore,
  useStudentStore,
  useTrainingProjectStore,
} from '~/store'

const message = useMessage()
const router = useRouter()
const { currentProfile, logout } = useLoginStore()
const { dataList: students } = useStudentStore()
const { list: bookings } = usePracticeBookingStore()
const { dataList: projects } = useTrainingProjectStore()
const { submitCancel, list: cancelList } = useCancelBookingStore()
const { list: reviews } = useDrivingReviewStore()
const { list: msgs } = useContactMessageStore()

const reason = ref('')

const meStudent = computed(() => {
  const id = currentProfile.value?.id
  if (id == null)
    return null
  return students.value.find(s => s.id === id) ?? null
})

const mine = computed(() => {
  const sid = currentProfile.value?.id
  if (sid == null)
    return []
  return bookings.value.filter(b => b.student_id === sid)
})

function projectLabel(pid: number) {
  return projects.value.find(p => p.id === pid)?.project_name ?? `#${pid}`
}

function requestCancel(b: (typeof bookings.value)[0]) {
  const sid = currentProfile.value?.id
  if (sid == null)
    return
  if (!reason.value.trim()) {
    message.warning('请填写取消原因')
    return
  }
  submitCancel({ appoint_id: b.id, student_id: sid, cancel_reason: reason.value.trim() })
  reason.value = ''
  message.success('取消申请已提交，请等候审核')
}

function out() {
  logout()
  router.push('/login')
}

const menu = [
  { to: '/h5/my-bookings', label: '我的练车预约', icon: 'icon-[icon-park-outline--calendar]', sub: '记录与状态' },
  { to: '/h5/exam', label: '考试申请', icon: 'icon-[icon-park-outline--notebook-one]', sub: '名额与审核' },
  { to: '/h5/pay', label: '支付费用', icon: 'icon-[icon-park-outline--wallet]', sub: '微信缴费·凭证' },
  { to: '/h5/review', label: '评价教练', icon: 'icon-[icon-park-outline--star]', sub: '双向评价' },
  { to: '/h5/messages', label: '消息与联系', icon: 'icon-[icon-park-outline--message]', sub: '教练会话' },
  { to: '/h5/ai', label: 'AI 咨询', icon: 'icon-[icon-park-outline--robot]', sub: '智能问答' },
] as const

const cancelMine = computed(() => {
  const sid = currentProfile.value?.id
  if (sid == null)
    return []
  return cancelList.value.filter(c => c.student_id === sid).sort((a, b) => b.id - a.id)
})

const pendingMsg = computed(() => {
  const id = currentProfile.value?.id
  if (id == null)
    return 0
  return msgs.value.filter(m => m.to_role === '学员' && m.to_id === id && m.read === 0).length
})

const pendingReview = computed(() => {
  const id = currentProfile.value?.id
  if (id == null)
    return 0
  return reviews.value.filter(r => r.student_id === id && r.coach_star > 0 && !r.student_reply?.trim()).length
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
      <img
        v-if="meStudent?.avatar"
        :src="meStudent.avatar"
        alt=""
        class="h-16 w-16 shrink-0 rounded-full border border-slate-100 object-cover"
      >
      <div
        v-else
        class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl font-bold text-[#07c160]"
      >
        {{ currentProfile?.displayName?.slice(0, 1) }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="text-lg font-semibold text-slate-900">
          {{ currentProfile?.displayName }}
        </div>
        <div class="mt-0.5 text-sm text-slate-500">
          {{ currentProfile?.username }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 rounded-xl bg-white p-2 shadow-sm">
      <RouterLink
        v-for="m in menu"
        :key="m.to"
        :to="m.to"
        class="flex flex-col items-center rounded-lg py-3 text-center active:bg-slate-50"
      >
        <span class="text-2xl text-[#07c160]" :class="[m.icon]" />
        <span class="mt-1 text-[11px] font-medium text-slate-800">{{ m.label }}</span>
        <span class="mt-0.5 text-[9px] text-slate-400">{{ m.sub }}</span>
      </RouterLink>
    </div>

    <n-card title="取消预约" size="small" embedded class="!rounded-xl">
      <n-input v-model:value="reason" type="textarea" placeholder="取消原因" :rows="2" />
      <div v-for="b in mine.filter(x => x.status === '已通过')" :key="b.id" class="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span class="text-sm text-slate-700">{{ projectLabel(b.project_id) }}</span>
        <n-button size="small" type="primary" secondary @click="requestCancel(b)">
          申请取消
        </n-button>
      </div>
      <n-empty v-if="!mine.filter(x => x.status === '已通过').length" class="mt-2" description="暂无可取消的已通过预约" />
    </n-card>

    <n-card v-if="cancelMine.length" title="取消申请进度" size="small" embedded class="!rounded-xl">
      <div v-for="c in cancelMine" :key="c.id" class="mb-2 flex justify-between text-sm last:mb-0">
        <span class="text-slate-600">预约 #{{ c.appoint_id }}</span>
        <n-tag size="small" :type="c.status === '已通过' ? 'success' : c.status === '已驳回' ? 'error' : 'warning'">
          {{ c.status }}
        </n-tag>
      </div>
    </n-card>

    <div class="flex gap-2 rounded-xl bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
      <span v-if="pendingMsg">未读消息 {{ pendingMsg }}</span>
      <span v-if="pendingReview"> · 待回复评价 {{ pendingReview }}</span>
      <span v-if="!pendingMsg && !pendingReview">暂无待办提醒</span>
    </div>

    <n-button block secondary @click="out">
      退出登录
    </n-button>
  </div>
</template>

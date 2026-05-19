<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import {
  useCancelBookingStore,
  useContactMessageStore,
  useDrivingReviewStore,
  useLoginStore,
  useStudentStore,
} from '~/store'

const router = useRouter()
const { currentProfile, logout } = useLoginStore()
const { dataList: students } = useStudentStore()

const meStudent = computed(() => {
  const id = currentProfile.value?.id
  if (id == null)
    return null
  return students.value.find(s => s.id === id) ?? null
})
const { list: cancelList } = useCancelBookingStore()
const { list: reviews } = useDrivingReviewStore()
const { list: msgs } = useContactMessageStore()

function out() {
  logout()
  router.push('/login')
}

const menu = [
  { to: '/h5/my-bookings', label: '我的练车预约', icon: 'icon-[icon-park-outline--calendar]', sub: '取消预约·记录' },
  { to: '/h5/exam', label: '考试申请', icon: 'icon-[icon-park-outline--notebook-one]', sub: '名额与审核' },
  { to: '/h5/pay', label: '支付费用', icon: 'icon-[icon-park-outline--wallet]', sub: '微信缴费·凭证' },
  { to: '/h5/review', label: '评价教练', icon: 'icon-[icon-park-outline--star]', sub: '双向评价' },
  { to: '/h5/messages', label: '消息与联系', icon: 'icon-[icon-park-outline--message]', sub: '教练会话' },
  { to: '/h5/ai', label: 'AI 咨询', icon: 'icon-[icon-park-outline--robot]', sub: '智能问答' },
] as const

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

const pendingCancel = computed(() => {
  const id = currentProfile.value?.id
  if (id == null)
    return 0
  return cancelList.value.filter(c => c.student_id === id && c.status === '待审核').length
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

    <div class="flex gap-2 rounded-xl bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
      <span v-if="pendingMsg">未读消息 {{ pendingMsg }}</span>
      <span v-if="pendingCancel"> · 取消待审 {{ pendingCancel }}</span>
      <span v-if="pendingReview"> · 待回复评价 {{ pendingReview }}</span>
      <span v-if="!pendingMsg && !pendingCancel && !pendingReview">暂无待办提醒</span>
    </div>

    <n-button block secondary @click="out">
      退出登录
    </n-button>
  </div>
</template>

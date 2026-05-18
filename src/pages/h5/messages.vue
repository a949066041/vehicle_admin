<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useContactMessageStore, useLoginStore } from '~/store'

const { currentProfile } = useLoginStore()
const { list } = useContactMessageStore()

const threads = computed(() => {
  const me = currentProfile.value
  if (!me || me.role !== '学员')
    return [] as { peerId: number, last: string, time: string }[]
  const byCoach = new Map<number, { last: string, time: string }>()
  for (const m of [...list.value].sort((a, b) => a.time.localeCompare(b.time))) {
    let coachId: number | null = null
    if (m.from_role === '教练')
      coachId = m.from_id
    else if (m.to_role === '教练')
      coachId = m.to_id
    if (coachId == null)
      continue
    byCoach.set(coachId, { last: m.content, time: m.time })
  }
  return [...byCoach.entries()]
    .map(([peerId, v]) => ({ peerId, ...v }))
    .sort((a, b) => b.time.localeCompare(a.time))
})
</script>

<template>
  <div class="space-y-3">
    <RouterLink
      to="/h5/ai"
      class="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm active:bg-slate-50"
    >
      <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-[#07c160]/15 text-xl">
        🤖
      </div>
      <div class="min-w-0 flex-1">
        <div class="font-medium text-slate-900">
          AI 智能咨询
        </div>
        <div class="truncate text-xs text-slate-500">
          驾考与练车常见问题
        </div>
      </div>
      <span class="icon-[icon-park-outline--right] text-slate-300" />
    </RouterLink>

    <h2 class="px-1 text-[15px] font-semibold text-slate-900">
      联系教练
    </h2>
    <RouterLink
      v-for="t in threads"
      :key="t.peerId"
      :to="`/h5/coach/${t.peerId}`"
      class="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm active:bg-slate-50"
    >
      <div class="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-[#07c160]">
        教
      </div>
      <div class="min-w-0 flex-1">
        <div class="font-medium text-slate-900">
          教练 #{{ t.peerId }}
        </div>
        <p class="truncate text-xs text-slate-500">
          {{ t.last }}
        </p>
      </div>
      <span class="shrink-0 text-[10px] text-slate-400">{{ t.time.slice(5, 16) }}</span>
    </RouterLink>
    <n-empty v-if="!threads.length" description="暂无会话，进入教练详情可留言" />
  </div>
</template>

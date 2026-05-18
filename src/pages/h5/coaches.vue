<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useCoachStore, useDrivingReviewStore } from '~/store'

const { dataList, updateData } = useCoachStore()
const { list: reviews } = useDrivingReviewStore()

const sortBy = ref<'click' | 'teach' | 'name'>('click')

const sortedList = computed(() => {
  const arr = [...dataList.value]
  if (sortBy.value === 'click')
    return arr.sort((a, b) => b.click_num - a.click_num)
  if (sortBy.value === 'teach')
    return arr.sort((a, b) => b.teach_age - a.teach_age)
  return arr.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
})

function bumpClick(row: (typeof dataList.value)[0]) {
  const i = dataList.value.findIndex(x => x.id === row.id)
  if (i < 0)
    return
  updateData(i, { ...row, click_num: row.click_num + 1 })
}

function avgStar(coachId: number) {
  const rs = reviews.value.filter(r => r.coach_id === coachId && r.student_star > 0)
  if (!rs.length)
    return null
  return (rs.reduce((s, r) => s + r.student_star, 0) / rs.length).toFixed(1)
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
      <span class="text-sm text-slate-700">排序方式</span>
      <n-select
        v-model:value="sortBy"
        class="!w-40"
        size="small"
        :options="[
          { label: '点击量', value: 'click' },
          { label: '教龄', value: 'teach' },
          { label: '姓名', value: 'name' },
        ]"
      />
    </div>
    <RouterLink
      v-for="c in sortedList"
      :key="c.id"
      :to="`/h5/coach/${c.id}`"
      class="flex gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm active:bg-slate-50"
      @click="bumpClick(c)"
    >
      <img
        v-if="c.avatar"
        :src="c.avatar"
        alt=""
        class="h-16 w-16 shrink-0 rounded-full border border-slate-100 object-cover"
      >
      <div
        v-else
        class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-lg font-bold text-[#07c160]"
      >
        {{ c.name.slice(0, 1) }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="font-medium text-slate-900">{{ c.name }}</span>
          <span v-if="avgStar(c.id)" class="text-xs text-amber-600">★ {{ avgStar(c.id) }}</span>
        </div>
        <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {{ c.intro }}
        </p>
        <p class="mt-1 text-[11px] text-slate-400">
          教龄 {{ c.teach_age }} 年 · 浏览 {{ c.click_num }}
        </p>
      </div>
      <span class="icon-[icon-park-outline--right] shrink-0 self-center text-slate-300" />
    </RouterLink>
  </div>
</template>

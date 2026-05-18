<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  useCoachStore,
  useDrivingReviewStore,
  useExamInfoStore,
  useNewsStore,
  useSiteStore,
  useTeachingResourceStore,
} from '~/store'

const { dataList: news } = useNewsStore()
const { dataList: coaches } = useCoachStore()
const { dataList: resources } = useTeachingResourceStore()
const { dataList: sites } = useSiteStore()
const { dataList: exams } = useExamInfoStore()
const { list: reviews } = useDrivingReviewStore()

const topCoaches = computed(() =>
  [...coaches.value].sort((a, b) => Number(b.click_num ?? 0) - Number(a.click_num ?? 0)).slice(0, 6),
)

function coachAvgStar(coachId: number | undefined) {
  if (coachId == null)
    return 0
  const list = reviews.value.filter(r => r.coach_id === coachId && r.student_star > 0)
  if (!list.length)
    return 0
  return Math.round((list.reduce((s, r) => s + r.student_star, 0) / list.length) * 10) / 10
}

const shortcuts = [
  { to: '/h5/book', label: '预约练车', icon: 'icon-[icon-park-outline--calendar]', desc: '选时段' },
  { to: '/h5/coaches', label: '教练', icon: 'icon-[icon-park-outline--peoples]', desc: '教龄·评价' },
  { to: '/h5/sites', label: '场地', icon: 'icon-[icon-park-outline--local]', desc: '地图' },
  { to: '/h5/exam', label: '考试', icon: 'icon-[icon-park-outline--notebook-one]', desc: '申请' },
  { to: '/h5/pay', label: '支付', icon: 'icon-[icon-park-outline--wallet]', desc: '费用缴纳' },
  { to: '/h5/vehicles', label: '车辆', icon: 'icon-[icon-park-outline--car]', desc: '空闲' },
  { to: '/h5/teaching', label: '学习', icon: 'icon-[icon-park-outline--book-open]', desc: '资料' },
] as const
</script>

<template>
  <div class="space-y-3 pb-2">
    <!-- 论文 5.3：首页聚合公告、教练、资源、场地、考试 -->
    <section class="overflow-hidden rounded-2xl bg-gradient-to-br from-[#07c160] to-[#06a050] px-4 py-4 text-white shadow-md">
      <p class="text-[13px] opacity-95">
        登录后进入首页 · 公告资讯 · 教练推荐 · 教学资源 · 场地与考试信息
      </p>
      <p class="mt-1 text-lg font-semibold tracking-tight">
        智慧驾校 · 一站式服务
      </p>
    </section>

    <!-- 金刚区（小程序常见布局） -->
    <div class="grid grid-cols-3 gap-2 rounded-xl bg-white p-3 shadow-sm">
      <RouterLink
        v-for="s in shortcuts"
        :key="s.to"
        :to="s.to"
        class="flex flex-col items-center gap-1 rounded-lg py-2 text-center active:bg-slate-50"
      >
        <span class="text-2xl text-[#07c160]" :class="[s.icon]" />
        <span class="text-xs font-medium text-slate-800">{{ s.label }}</span>
        <span class="text-[10px] text-slate-400">{{ s.desc }}</span>
      </RouterLink>
    </div>

    <!-- 公告资讯 -->
    <div class="flex items-end justify-between px-0.5">
      <h2 class="text-[15px] font-semibold text-slate-800">
        公告资讯
      </h2>
      <RouterLink to="/h5/news" class="text-xs text-[#576b95]">
        更多
      </RouterLink>
    </div>
    <div class="space-y-2">
      <RouterLink
        v-for="n in news.slice(0, 4)"
        :key="n.id"
        :to="`/h5/news/${n.id}`"
        class="flex gap-3 overflow-hidden rounded-xl bg-white p-3 shadow-sm active:bg-slate-50"
      >
        <div
          class="flex h-[4.5rem] w-24 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400"
          :style="n.cover ? { backgroundImage: `url(${n.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
        >
          <span v-if="!n.cover">资讯</span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="line-clamp-2 text-[15px] font-medium leading-snug text-slate-900">
            {{ n.title }}
          </div>
          <p class="mt-1 line-clamp-1 text-xs text-slate-500">
            {{ n.summary }}
          </p>
          <p class="mt-1 text-[11px] text-slate-400">
            {{ n.publish_time }}
          </p>
        </div>
      </RouterLink>
    </div>

    <!-- 推荐教练 -->
    <div class="flex items-end justify-between px-0.5">
      <h2 class="text-[15px] font-semibold text-slate-800">
        推荐教练
      </h2>
      <RouterLink to="/h5/coaches" class="text-xs text-[#576b95]">
        全部 · 排序
      </RouterLink>
    </div>
    <div class="-mx-1 flex gap-2 overflow-x-auto pb-1 pl-1">
      <RouterLink
        v-for="c in topCoaches"
        :key="c.id"
        :to="`/h5/coach/${c.id}`"
        class="w-[7.25rem] shrink-0 rounded-xl border border-slate-100 bg-white p-2.5 text-center shadow-sm active:bg-slate-50"
      >
        <img
          v-if="c.avatar"
          :src="c.avatar"
          alt=""
          class="mx-auto h-14 w-14 rounded-full border border-slate-100 object-cover"
        >
        <div
          v-else
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-base font-bold text-[#07c160]"
        >
          {{ (c.name || '-').slice(0, 1) }}
        </div>
        <div class="mt-2 truncate text-xs font-medium text-slate-900">
          {{ c.name }}
        </div>
        <div class="mt-0.5 text-[10px] text-slate-500">
          教龄{{ c.teach_age }}年
        </div>
        <div v-if="coachAvgStar(c.id)" class="mt-1 text-[10px] text-amber-600">
          ★ {{ coachAvgStar(c.id) }}
        </div>
      </RouterLink>
    </div>

    <!-- 教学资源 -->
    <div class="flex items-end justify-between px-0.5">
      <h2 class="text-[15px] font-semibold text-slate-800">
        教学资源
      </h2>
      <RouterLink to="/h5/teaching" class="text-xs text-[#576b95]">
        更多
      </RouterLink>
    </div>
    <div class="space-y-2">
      <RouterLink
        v-for="r in resources.slice(0, 3)"
        :key="r.id"
        :to="`/h5/teaching/${r.id}`"
        class="flex items-center justify-between rounded-xl bg-white px-3 py-3 shadow-sm active:bg-slate-50"
      >
        <div class="min-w-0 pr-2">
          <div class="truncate text-sm font-medium text-slate-900">
            {{ r.resource_name }}
          </div>
          <div class="mt-0.5 text-xs text-slate-500">
            {{ r.resource_type }} · {{ r.click_num }} 次浏览
          </div>
        </div>
        <span class="icon-[icon-park-outline--right] shrink-0 text-slate-300" />
      </RouterLink>
    </div>

    <!-- 场地速览 -->
    <div class="flex items-end justify-between px-0.5">
      <h2 class="text-[15px] font-semibold text-slate-800">
        练车场地
      </h2>
      <RouterLink to="/h5/sites" class="text-xs text-[#576b95]">
        地图导航
      </RouterLink>
    </div>
    <div class="space-y-2">
      <RouterLink
        v-for="s in sites.slice(0, 2)"
        :key="s.id"
        to="/h5/sites"
        class="block rounded-xl bg-white px-3 py-3 shadow-sm active:bg-slate-50"
      >
        <div class="text-sm font-medium text-slate-900">
          {{ s.site_name }}
        </div>
        <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {{ s.site_address }}
        </p>
      </RouterLink>
    </div>

    <!-- 考试信息入口 -->
    <div class="flex items-end justify-between px-0.5">
      <h2 class="text-[15px] font-semibold text-slate-800">
        考试信息
      </h2>
      <RouterLink to="/h5/exam" class="text-xs text-[#576b95]">
        去申请
      </RouterLink>
    </div>
    <div class="space-y-2">
      <RouterLink
        v-for="e in exams.filter(x => x.status === '可预约').slice(0, 2)"
        :key="e.id"
        to="/h5/exam"
        class="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3 active:bg-emerald-50"
      >
        <div>
          <div class="text-sm font-medium text-slate-900">
            {{ e.exam_name }}
          </div>
          <div class="mt-0.5 text-xs text-slate-600">
            {{ e.exam_date }} · 余 {{ Math.max(0, Number(e.max_num ?? 0) - Number(e.booked_num ?? 0)) }} 席
          </div>
        </div>
        <span class="rounded-full bg-[#07c160] px-2.5 py-1 text-[11px] text-white">
          可约
        </span>
      </RouterLink>
    </div>
  </div>
</template>

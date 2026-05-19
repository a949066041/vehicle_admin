<script lang="ts" setup>
import type { MenuOption } from 'naive-ui'
import { RouterLink } from 'vue-router'
import { useLoginStore } from '~/store'

function renderIcon(icon: string) {
  return () => h('span', { class: icon })
}

const { currentProfile, logout } = useLoginStore()
const router = useRouter()

const menuOptions: MenuOption[] = [
  {
    label: '用户与人员',
    key: 'users',
    icon: renderIcon('icon-[icon-park-outline--peoples]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/student-list' }, '学员管理'), key: 'student-list' },
      { label: () => h(RouterLink, { to: '/back/coach-list' }, '教练管理'), key: 'coach-list' },
    ],
  },
  {
    label: '车辆与场地',
    key: 'veh-site',
    icon: renderIcon('icon-[icon-park-outline--building-four]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/vehicle-list' }, '车辆信息管理'), key: 'vehicle-list' },
      { label: () => h(RouterLink, { to: '/back/vehicle-apply-list' }, '车辆申请管理'), key: 'vehicle-apply-list' },
      { label: () => h(RouterLink, { to: '/back/site-list' }, '场地信息'), key: 'site-list' },
    ],
  },
  {
    label: '练车与预约',
    key: 'train',
    icon: renderIcon('icon-[icon-park-outline--calendar]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/training-project-list' }, '练车项目管理'), key: 'training-project-list' },
      { label: () => h(RouterLink, { to: '/back/practice-booking-list' }, '练车预约管理'), key: 'practice-booking-list' },
      { label: () => h(RouterLink, { to: '/back/cancel-booking-list' }, '取消预约管理'), key: 'cancel-booking-list' },
    ],
  },
  {
    label: '考试与费用',
    key: 'exam-fee',
    icon: renderIcon('icon-[icon-park-outline--notebook-one]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/exam-info-list' }, '考试信息管理'), key: 'exam-info-list' },
      { label: () => h(RouterLink, { to: '/back/exam-apply-list' }, '考试申请管理'), key: 'exam-apply-list' },
      { label: () => h(RouterLink, { to: '/back/fee-list' }, '费用信息管理'), key: 'fee-list' },
    ],
  },
  {
    label: '资源与评价',
    key: 'res',
    icon: renderIcon('icon-[icon-park-outline--message]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/news-list' }, '公告资讯管理'), key: 'news-list' },
      { label: () => h(RouterLink, { to: '/back/review-list' }, '评价管理'), key: 'review-list' },
    ],
  },
  {
    label: '运营分析',
    key: 'stats',
    icon: renderIcon('icon-[icon-park-outline--chart-line]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/stats' }, '统计功能'), key: 'stats-page' },
    ],
  },
]

function handelLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <n-layout has-sider class="min-h-screen">
    <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240">
      <div class="px-4 py-5">
        <div class="text-lg font-bold text-teal-700">
          驾校管理后台
        </div>
        <div class="mt-1 text-xs leading-snug text-slate-500">
          管理端：用户、车辆、场地、预约、考试、费用、资源、评价、统计
        </div>
      </div>
      <n-menu
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
      />
    </n-layout-sider>
    <n-layout>
      <div class="flex flex-col overflow-auto px-4 py-2">
        <header class="flex justify-end border-b border-slate-100 pb-2">
          <n-popconfirm @positive-click="handelLogout">
            <template #trigger>
              <n-button quaternary>
                {{ currentProfile?.displayName }}（退出）
              </n-button>
            </template>
            确认退出？
          </n-popconfirm>
        </header>
        <div class="flex-1 py-4">
          <RouterView />
        </div>
      </div>
    </n-layout>
  </n-layout>
</template>

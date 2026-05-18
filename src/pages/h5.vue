<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: '首页', path: '/h5/home', icon: 'icon-[icon-park-outline--home-two]' },
  { name: '预约', path: '/h5/book', icon: 'icon-[icon-park-outline--calendar]' },
  { name: '考试', path: '/h5/exam', icon: 'icon-[icon-park-outline--notebook-one]' },
  { name: '消息', path: '/h5/messages', icon: 'icon-[icon-park-outline--message]' },
  { name: '我的', path: '/h5/profile', icon: 'icon-[icon-park-outline--user]' },
]

const active = computed(() => {
  const p = route.path
  if (
    p.startsWith('/h5/home')
    || p.startsWith('/h5/news')
    || p.startsWith('/h5/teaching')
    || p.startsWith('/h5/vehicles')
  ) {
    return '/h5/home'
  }
  if (p.startsWith('/h5/book') || p.startsWith('/h5/coach') || p.startsWith('/h5/coaches') || p.startsWith('/h5/sites'))
    return '/h5/book'
  if (p.startsWith('/h5/exam') || p.startsWith('/h5/exam-success'))
    return '/h5/exam'
  if (p.startsWith('/h5/messages') || p.startsWith('/h5/ai'))
    return '/h5/messages'
  if (p.startsWith('/h5/profile') || p.startsWith('/h5/pay') || p.startsWith('/h5/pay-success') || p.startsWith('/h5/fees') || p.startsWith('/h5/review') || p.startsWith('/h5/my-bookings'))
    return '/h5/profile'
  return ''
})
</script>

<template>
  <div class="h5-shell min-h-dvh flex flex-col bg-[#ededed] pb-[calc(3.25rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]">
    <header class="sticky top-0 z-10 border-b border-black/6 bg-[#f7f7f7]/95 px-3 py-2.5 text-center text-[17px] font-semibold text-slate-900 backdrop-blur">
      驾校通 · 学员端
    </header>
    <main class="flex-1 overflow-y-auto px-2.5 py-2">
      <RouterView />
    </main>
    <nav
      class="fixed bottom-0 left-0 right-0 z-20 flex border-t border-black/8 bg-[#f7f7f7] pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_rgba(0,0,0,0.06)]"
    >
      <button
        v-for="t in tabs"
        :key="t.path"
        type="button"
        class="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] transition"
        :class="active === t.path ? 'text-[#07c160]' : 'text-slate-500'"
        @click="router.push(t.path)"
      >
        <span class="text-[22px] leading-none" :class="[t.icon]" />
        {{ t.name }}
      </button>
    </nav>
  </div>
</template>

<style scoped>
/* 论文：遵循微信小程序常见主色与按钮观感 */
.h5-shell :deep(.n-button--primary-type) {
  --n-color: #07c160 !important;
  --n-color-hover: #06ad56 !important;
  --n-color-pressed: #059c4c !important;
  --n-color-focus: #07c160 !important;
  --n-border: 1px solid #07c160 !important;
}
.h5-shell :deep(.n-button--primary-type.n-button--disabled) {
  opacity: 0.45;
}
</style>

<script setup lang="ts">
import type { RoleType } from '~/types/driving-school'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginStore } from '~/store'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const { login } = useLoginStore()

const form = reactive({
  role: '学员' as RoleType,
  account: '',
  password: '',
})
const loading = ref(false)

const accountPlaceholder = computed(() => {
  if (form.role === '教练')
    return '教练用户名'
  if (form.role === '管理员')
    return '管理员用户名'
  return '学员用户名'
})

function handleLogin() {
  const a = form.account.trim()
  const p = form.password
  if (!a || !p) {
    message.warning('请输入账号和密码')
    return
  }
  loading.value = true
  try {
    const res = login(form.role, a, p)
    if (!res.ok) {
      message.error(res.message || '登录失败')
      return
    }
    message.success('登录成功')
    const redirect = route.query.redirect as string | undefined
    if (redirect) {
      router.replace(redirect)
      return
    }
    if (form.role === '管理员')
      router.replace('/back')
    else if (form.role === '教练')
      router.replace('/coach')
    else
      router.replace('/h5/home')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 sm:px-8">
    <div
      class="login relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10"
    >
      <h1 class="mb-1 text-center text-[22px] font-semibold text-slate-900">
        用户登录
      </h1>
      <n-space vertical :size="14">
        <div>
          <n-radio-group v-model:value="form.role" name="role" class="w-full">
            <n-space>
              <n-radio value="学员">
                学员
              </n-radio>
              <n-radio value="教练">
                教练
              </n-radio>
              <n-radio value="管理员">
                管理员
              </n-radio>
            </n-space>
          </n-radio-group>
        </div>
        <n-input
          v-model:value="form.account"
          size="large"
          :placeholder="accountPlaceholder"
          @keydown.enter.prevent="handleLogin"
        >
          <template #prefix>
            <span class="icon-[icon-park-outline--user] text-lg text-slate-400" />
          </template>
        </n-input>
        <n-input
          v-model:value="form.password"
          size="large"
          type="password"
          show-password-on="click"
          placeholder="密码"
          @keydown.enter.prevent="handleLogin"
        >
          <template #prefix>
            <span class="icon-[icon-park-outline--lock] text-lg text-slate-400" />
          </template>
        </n-input>
        <n-space :size="12" class="w-full">
          <n-button type="primary" class="!flex-1" size="large" :loading="loading" @click="handleLogin">
            登录
          </n-button>
          <n-button class="!flex-1" size="large" secondary @click="router.push('/register')">
            <template #icon>
              <span class="icon-[icon-park-outline--plus]" />
            </template>
            学员注册
          </n-button>
        </n-space>
        <div class="flex justify-center text-sm">
          <n-button text type="primary" @click="router.push('/forgot-password')">
            找回密码
          </n-button>
        </div>
      </n-space>
      <p class="mt-6 text-center text-xs leading-relaxed text-slate-500">
        演示：管理员 admin001 / 123456；教练 coach001 / 123456；学员 202501 或 student001 / 123456
      </p>
    </div>
  </div>
</template>

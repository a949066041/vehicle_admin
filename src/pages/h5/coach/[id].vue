<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useRoute } from 'vue-router'
import { useCoachStore, useContactMessageStore, useDrivingReviewStore, useLoginStore } from '~/store'

const message = useMessage()
const route = useRoute()
const id = computed(() => Number(route.params.id))
const { dataList } = useCoachStore()
const coach = computed(() => dataList.value.find(c => c.id === id.value))
const { send } = useContactMessageStore()
const { list: reviews } = useDrivingReviewStore()
const { currentProfile } = useLoginStore()
const text = ref('')

const publicReviews = computed(() =>
  [...reviews.value]
    .filter(r => r.coach_id === id.value && r.student_star > 0 && r.student_comment?.trim())
    .sort((a, b) => (b.addtime ?? '').localeCompare(a.addtime ?? '')),
)

function sendMsg() {
  const sid = currentProfile.value?.id
  if (sid == null || !coach.value) {
    message.error('无法发送')
    return
  }
  if (!text.value.trim()) {
    message.warning('请输入内容')
    return
  }
  send({
    from_role: '学员',
    from_id: sid,
    to_role: '教练',
    to_id: coach.value.id,
    content: text.value.trim(),
  })
  text.value = ''
  message.success('已发送给教练')
}
</script>

<template>
  <div v-if="coach" class="space-y-4">
    <div class="rounded-xl bg-white p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <img
          v-if="coach.avatar"
          :src="coach.avatar"
          alt=""
          class="h-16 w-16 shrink-0 rounded-full border border-slate-200 object-cover"
        >
        <div
          v-else
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl font-bold text-[#07c160]"
        >
          {{ coach.name.slice(0, 1) }}
        </div>
        <div>
          <h1 class="text-lg font-semibold text-slate-900">
            {{ coach.name }}
          </h1>
          <p class="text-sm text-slate-500">
            {{ coach.phone }} · 教龄 {{ coach.teach_age }} 年 · 浏览 {{ coach.click_num }}
          </p>
        </div>
      </div>
      <p class="mt-3 text-sm leading-relaxed text-slate-600">
        {{ coach.intro }}
      </p>
    </div>

    <div class="rounded-xl bg-white p-4 shadow-sm">
      <h2 class="text-[15px] font-semibold text-slate-900">
        学员评价
      </h2>
      <div v-for="r in publicReviews" :key="r.id" class="mt-3 border-t border-slate-100 pt-3 first:mt-2 first:border-t-0 first:pt-0">
        <div class="text-amber-600">
          ★ {{ r.student_star }}
        </div>
        <p class="mt-1 text-sm text-slate-800">
          {{ r.student_comment }}
        </p>
      </div>
      <n-empty v-if="!publicReviews.length" class="mt-4" description="暂无评价" />
    </div>

    <div class="rounded-xl bg-white p-4 shadow-sm">
      <h2 class="text-[15px] font-semibold text-slate-900">
        联系教练
      </h2>
      <n-input v-model:value="text" class="mt-3" type="textarea" placeholder="给教练留言" :rows="3" />
      <n-button class="mt-3" type="primary" block @click="sendMsg">
        发送
      </n-button>
    </div>
  </div>
  <n-empty v-else description="教练不存在" />
</template>

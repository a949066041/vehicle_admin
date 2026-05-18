<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useCoachStore, useDrivingReviewStore, useLoginStore } from '~/store'

const message = useMessage()
const router = useRouter()
const route = useRoute()
const { currentProfile } = useLoginStore()
const { dataList: coaches } = useCoachStore()
const { list, upsertStudentReview } = useDrivingReviewStore()

const coachId = ref<number | null>(coaches.value[0]?.id ?? null)
const star = ref(5)
const comment = ref('')

const existing = computed(() => {
  const sid = currentProfile.value?.id
  if (sid == null || coachId.value == null)
    return null
  return list.value.find(r => r.student_id === sid && r.coach_id === coachId.value)
})

function submit() {
  const sid = currentProfile.value?.id
  if (sid == null) {
    message.error('登录已失效，请重新登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (coachId.value == null) {
    message.error('请选择教练')
    return
  }
  upsertStudentReview({
    student_id: sid,
    coach_id: coachId.value,
    student_star: star.value,
    student_comment: comment.value.trim() || '满意',
  })
  message.success('评价已提交')
}

const coachName = computed(() => coaches.value.find(c => c.id === coachId.value)?.name ?? '')
</script>

<template>
  <div class="space-y-4">
    <n-select
      v-model:value="coachId"
      :options="coaches.map(c => ({ label: c.name, value: c.id }))"
      placeholder="选择教练"
    />
    <div>
      <div class="mb-1 text-sm text-slate-600">
        我的评分（1–5 星）
      </div>
      <n-rate v-model:value="star" />
    </div>
    <n-input v-model:value="comment" type="textarea" placeholder="评价内容" :rows="3" />
    <n-button type="primary" block @click="submit">
      提交评价
    </n-button>

    <n-divider>双向评价</n-divider>
    <div v-if="existing" class="space-y-3 rounded-xl bg-white p-3 shadow-sm">
      <div>
        <div class="text-xs font-medium text-slate-500">
          我对 {{ coachName }} 的评价
        </div>
        <div class="mt-1 text-amber-600">
          ★ {{ existing.student_star }}
        </div>
        <p class="mt-1 text-sm text-slate-800">
          {{ existing.student_comment }}
        </p>
      </div>
      <div v-if="existing.coach_star || existing.coach_comment" class="border-t border-slate-100 pt-3">
        <div class="text-xs font-medium text-slate-500">
          教练对我的评价
        </div>
        <div v-if="existing.coach_star" class="mt-1 text-amber-600">
          ★ {{ existing.coach_star }}
        </div>
        <p class="mt-1 text-sm text-slate-800">
          {{ existing.coach_comment }}
        </p>
      </div>
      <div v-if="existing.coach_reply || existing.student_reply" class="border-t border-slate-100 pt-3 text-xs text-slate-600">
        <p v-if="existing.coach_reply">
          <span class="text-slate-400">教练回复：</span>{{ existing.coach_reply }}
        </p>
        <p v-if="existing.student_reply" class="mt-2">
          <span class="text-slate-400">我的回复：</span>{{ existing.student_reply }}
        </p>
      </div>
    </div>
    <n-empty v-else description="暂无评价记录，提交后将显示在此" />
  </div>
</template>

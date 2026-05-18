<script setup lang="ts">
import { useExamApplyStore, useExamInfoStore, useLoginStore } from '~/store'

const route = useRoute()
const router = useRouter()
const { list: applies } = useExamApplyStore()
const { dataList: exams } = useExamInfoStore()
const { currentProfile } = useLoginStore()

const applyId = computed(() => Number(route.query.applyId || 0))

const record = computed(() => {
  const sid = currentProfile.value?.id
  if (!sid || !applyId.value)
    return null
  return applies.value.find(a => a.id === applyId.value && a.student_id === sid) ?? null
})

const exam = computed(() => {
  if (!record.value)
    return null
  return exams.value.find(e => e.id === record.value!.exam_id) ?? null
})
</script>

<template>
  <div class="space-y-3">
    <n-result
      status="success"
      title="考试申请提交成功"
      description="管理员审核后会在考试申请列表中更新状态"
      class="rounded-xl bg-white"
    />

    <n-card title="申请信息" size="small" embedded class="!rounded-xl">
      <template v-if="record">
        <div class="space-y-2 text-sm text-slate-700">
          <p>考试名称：{{ exam?.exam_name || `考试 #${record.exam_id}` }}</p>
          <p>考试科目：{{ exam?.exam_subject || '-' }}</p>
          <p>考试地址：{{ exam?.exam_address || '-' }}</p>
          <p>考试时间：{{ exam?.exam_date || '-' }}</p>
          <p>申请时间：{{ record.addtime || record.apply_date }}</p>
          <p>申请状态：{{ record.status }}</p>
        </div>
      </template>
      <n-empty v-else description="未找到申请记录" />
    </n-card>

    <div class="grid grid-cols-2 gap-2">
      <n-button type="primary" @click="router.push('/h5/exam')">
        返回考试页
      </n-button>
      <n-button secondary @click="router.push('/h5/pay')">
        去支付费用
      </n-button>
    </div>
  </div>
</template>

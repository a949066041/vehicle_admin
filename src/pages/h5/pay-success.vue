<script setup lang="ts">
import { useFeeStore, useLoginStore } from '~/store'

const route = useRoute()
const router = useRouter()
const { dataList } = useFeeStore()
const { currentProfile } = useLoginStore()

const feeId = computed(() => Number(route.query.feeId || 0))
const record = computed(() => {
  const sid = currentProfile.value?.id
  if (!sid || !feeId.value)
    return null
  return dataList.value.find(f => f.id === feeId.value && f.student_id === sid) ?? null
})
</script>

<template>
  <div class="space-y-3">
    <n-result
      status="success"
      title="支付成功"
      description="已完成在线支付，凭证可在费用记录中查看"
      class="rounded-xl bg-white"
    />

    <n-card title="支付凭证" size="small" embedded class="!rounded-xl">
      <template v-if="record">
        <div class="space-y-2 text-sm text-slate-700">
          <p>费用名称：{{ record.fee_name }}</p>
          <p>费用类型：{{ record.fee_type }}</p>
          <p>支付金额：¥{{ record.fee_amount }}</p>
          <p>支付时间：{{ record.pay_time || '-' }}</p>
          <p>支付状态：{{ record.pay_status }}</p>
          <p>发票凭证：{{ record.invoice || '-' }}</p>
        </div>
      </template>
      <n-empty v-else description="未找到支付记录" />
    </n-card>

    <div class="grid grid-cols-2 gap-2">
      <n-button type="primary" @click="router.push('/h5/pay')">
        返回支付页
      </n-button>
      <n-button secondary @click="router.push('/h5/profile')">
        返回我的
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useMessage } from 'naive-ui'
import { useFeeStore, useLoginStore } from '~/store'

const message = useMessage()
const router = useRouter()
const { currentProfile } = useLoginStore()
const { dataList, payFee } = useFeeStore()

const mine = computed(() => {
  const sid = currentProfile.value?.id
  if (sid == null)
    return []
  return dataList.value.filter(f => f.student_id === sid)
})

function pay(row: (typeof dataList.value)[0]) {
  if (row.pay_status === '已支付') {
    message.info('该订单已支付')
    return
  }
  if (!payFee(row.id)) {
    message.error('支付失败')
    return
  }
  router.push({ path: '/h5/pay-success', query: { feeId: String(row.id) } })
}

function copyInvoice(inv: string) {
  if (!inv)
    return
  void navigator.clipboard?.writeText(inv).then(() => {
    message.success('发票凭证号已复制')
  }).catch(() => {
    message.info(inv)
  })
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="f in mine"
      :key="f.id"
      class="overflow-hidden rounded-xl bg-white shadow-sm"
    >
      <div class="border-b border-slate-100 px-3 py-3">
        <div class="flex justify-between gap-2">
          <span class="text-[15px] font-medium text-slate-900">{{ f.fee_name }}</span>
          <span class="text-lg font-semibold text-[#fa5151]">¥{{ f.fee_amount }}</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">
          {{ f.fee_type }} · {{ f.pay_status }}
          <template v-if="f.pay_time">
            · {{ f.pay_time }}
          </template>
        </p>
      </div>
      <div class="flex gap-2 p-3">
        <n-button
          v-if="f.pay_status === '待支付'"
          class="flex-1"
          type="primary"
          size="large"
          @click="pay(f)"
        >
          微信支付
        </n-button>
        <n-button
          v-if="f.invoice"
          secondary
          class="flex-1"
          size="large"
          @click="copyInvoice(f.invoice)"
        >
          复制发票凭证
        </n-button>
      </div>
    </div>
    <n-empty v-if="!mine.length" description="暂无费用订单" />
  </div>
</template>

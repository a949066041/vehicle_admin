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
  return [...dataList.value]
    .filter(f => f.student_id === sid)
    .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))
})

const unpaid = computed(() => mine.value.filter(f => f.pay_status === '待支付'))
const paid = computed(() => mine.value.filter(f => f.pay_status === '已支付'))

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
    <n-card title="待支付费用" size="small" embedded class="!rounded-xl">
      <div v-for="f in unpaid" :key="f.id" class="mb-2 rounded-lg bg-white p-3 last:mb-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-slate-900">
              {{ f.fee_name }}
            </div>
            <div class="mt-1 text-xs text-slate-500">
              {{ f.fee_type }}
            </div>
          </div>
          <span class="text-base font-semibold text-[#fa5151]">¥{{ f.fee_amount }}</span>
        </div>
        <n-button class="mt-3 w-full" type="primary" @click="pay(f)">
          微信支付
        </n-button>
      </div>
      <n-empty v-if="!unpaid.length" description="暂无待支付订单" />
    </n-card>

    <n-card title="支付记录" size="small" embedded class="!rounded-xl">
      <div v-for="f in paid" :key="f.id" class="mb-2 rounded-lg bg-white p-3 last:mb-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-slate-900">
              {{ f.fee_name }}
            </div>
            <div class="mt-1 text-xs text-slate-500">
              {{ f.fee_type }} · {{ f.pay_time || '-' }}
            </div>
            <div class="mt-1 text-xs text-slate-500">
              凭证号：{{ f.invoice || '-' }}
            </div>
          </div>
          <span class="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">已支付</span>
        </div>
        <n-button v-if="f.invoice" secondary class="mt-3 w-full" @click="copyInvoice(f.invoice)">
          复制发票凭证
        </n-button>
      </div>
      <n-empty v-if="!paid.length" description="暂无支付记录" />
    </n-card>
  </div>
</template>

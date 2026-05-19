import type { FeeRecord } from '~/types/driving-school'
import { createGlobalState } from '@vueuse/core'
import dayjs from 'dayjs'
import { useCurd } from '~/hooks'

const RECEIPT_IMG = 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=200&h=200&fit=crop'

/** 与设计图 5.32 一致的费用假数据 */
const initData: FeeRecord[] = [
  { id: 1, student_id: 1, fee_name: '报名费', fee_amount: 3500, fee_type: '报名费', enroll_type: '包补考', pay_status: '已支付', pay_date: '2025-03-20', pay_time: '2025-03-20 10:30:00', invoice: 'INV-20250320001', invoice_image: RECEIPT_IMG },
  { id: 2, student_id: 2, fee_name: '报名费', fee_amount: 2500, fee_type: '报名费', enroll_type: '仅包初考', pay_status: '已支付', pay_date: '2025-03-26', pay_time: '2025-03-26 14:20:00', invoice: 'INV-20250326002', invoice_image: RECEIPT_IMG },
  { id: 3, student_id: 3, fee_name: '报名费', fee_amount: 2500, fee_type: '报名费', enroll_type: '仅包初考', pay_status: '已支付', pay_date: '2025-04-04', pay_time: '2025-04-04 09:15:00', invoice: 'INV-20250404003', invoice_image: RECEIPT_IMG },
  { id: 4, student_id: 4, fee_name: '报名费', fee_amount: 3500, fee_type: '报名费', enroll_type: '包补考', pay_status: '已支付', pay_date: '2025-04-18', pay_time: '2025-04-18 16:40:00', invoice: 'INV-20250418004', invoice_image: RECEIPT_IMG },
  { id: 5, student_id: 5, fee_name: '报名费', fee_amount: 2500, fee_type: '报名费', enroll_type: '仅包初考', pay_status: '已支付', pay_date: '2025-05-10', pay_time: '2025-05-10 11:00:00', invoice: 'INV-20250510005', invoice_image: RECEIPT_IMG },
  { id: 6, student_id: 6, fee_name: '报名费', fee_amount: 3500, fee_type: '报名费', enroll_type: '包补考', pay_status: '已支付', pay_date: '2025-04-22', pay_time: '2025-04-22 13:25:00', invoice: 'INV-20250422006', invoice_image: RECEIPT_IMG },
  { id: 7, student_id: 7, fee_name: '报名费', fee_amount: 2500, fee_type: '报名费', enroll_type: '仅包初考', pay_status: '待支付', pay_date: '', pay_time: null, invoice: '', invoice_image: '' },
  { id: 8, student_id: 8, fee_name: '报名费', fee_amount: 3500, fee_type: '报名费', enroll_type: '包补考', pay_status: '待支付', pay_date: '', pay_time: null, invoice: '', invoice_image: '' },
  { id: 9, student_id: 9, fee_name: '报名费', fee_amount: 2500, fee_type: '报名费', enroll_type: '仅包初考', pay_status: '已支付', pay_date: '2025-05-08', pay_time: '2025-05-08 15:30:00', invoice: 'INV-20250508009', invoice_image: RECEIPT_IMG },
  { id: 10, student_id: 10, fee_name: '补考费', fee_amount: 800, fee_type: '补考费', enroll_type: '包补考', pay_status: '待支付', pay_date: '', pay_time: null, invoice: '', invoice_image: '' },
  { id: 11, student_id: 1, fee_name: '科目二练车费', fee_amount: 600, fee_type: '练车费', enroll_type: '包补考', pay_status: '已支付', pay_date: '2025-05-12', pay_time: '2025-05-12 08:20:00', invoice: 'INV-20250512011', invoice_image: RECEIPT_IMG },
  { id: 12, student_id: 3, fee_name: '科目三考试费', fee_amount: 500, fee_type: '考试费', enroll_type: '仅包初考', pay_status: '待支付', pay_date: '', pay_time: null, invoice: '', invoice_image: '' },
]

export const useFeeStore = createGlobalState(() => {
  const curd = useCurd<FeeRecord>({ key: 'driving-school-fees-v2', initData })

  function payFee(feeId: number) {
    const i = curd.dataList.value.findIndex(f => f.id === feeId)
    if (i < 0)
      return false
    const row = curd.dataList.value[i]!
    if (row.pay_status === '已支付')
      return false
    const now = dayjs()
    curd.updateData(i, {
      ...row,
      pay_status: '已支付',
      pay_date: now.format('YYYY-MM-DD'),
      pay_time: now.format('YYYY-MM-DD HH:mm:ss'),
      invoice: `INV-${now.format('YYYYMMDDHHmmss')}`,
      invoice_image: row.invoice_image || RECEIPT_IMG,
    })
    return true
  }

  /** 指定月份已支付金额合计（YYYY-MM） */
  function monthlyPaidAmount(yearMonth: string) {
    return curd.dataList.value
      .filter(f => f.pay_status === '已支付' && (f.pay_date ?? f.pay_time ?? '').startsWith(yearMonth))
      .reduce((sum, f) => sum + f.fee_amount, 0)
  }

  return { ...curd, payFee, monthlyPaidAmount, RECEIPT_IMG }
})

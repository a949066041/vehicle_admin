import type { CancelBookingRequest } from '~/types/driving-school'
import { createGlobalState, useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { seedCancelBookings } from '~/constants/back-office-list-seed'
import { nextNumericId } from '~/utils/driving-school'
import { usePracticeBookingStore } from './practiceBooking.store'

export const useCancelBookingStore = createGlobalState(() => {
  const list = useLocalStorage<CancelBookingRequest[]>(
    'driving-school-cancel-bookings-v4',
    () => seedCancelBookings.map(r => ({ ...r })),
  )

  function submitCancel(input: { appoint_id: number, student_id: number, cancel_reason: string }) {
    const dup = list.value.some(
      c => c.appoint_id === input.appoint_id && c.student_id === input.student_id && c.status === '待审核',
    )
    if (dup)
      return { ok: false, message: '该预约已有待审核的取消申请' }
    const row: CancelBookingRequest = {
      id: nextNumericId(list.value),
      appoint_id: input.appoint_id,
      student_id: input.student_id,
      cancel_reason: input.cancel_reason,
      status: '待审核',
      check_remark: '',
      addtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    list.value = [...list.value, row]
    return { ok: true, row, message: '取消申请已提交，请等候审核' }
  }

  function cancelForAppoint(appointId: number) {
    return list.value.find(c => c.appoint_id === appointId) ?? null
  }

  function setStatus(id: number, status: CancelBookingRequest['status'], check_remark?: string) {
    const i = list.value.findIndex(x => x.id === id)
    if (i < 0)
      return false
    const cur = list.value[i]!
    list.value[i] = { ...cur, status, check_remark: check_remark ?? cur.check_remark }
    list.value = [...list.value]
    if (status === '已通过') {
      const { setStatus: setBookingStatus } = usePracticeBookingStore()
      setBookingStatus(cur.appoint_id, '已取消', check_remark)
    }
    return true
  }

  function removeCancels(ids: number[]) {
    const set = new Set(ids)
    list.value = list.value.filter(x => !set.has(x.id))
  }

  return { list, submitCancel, setStatus, cancelForAppoint, removeCancels }
})

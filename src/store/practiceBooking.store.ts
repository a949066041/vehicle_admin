import type { PracticeBooking } from '~/types/driving-school'
import { createGlobalState, useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { seedPracticeBookings } from '~/constants/back-office-list-seed'
import { nextNumericId } from '~/utils/driving-school'
import { useTrainingProjectStore } from './trainingProject.store'

export const usePracticeBookingStore = createGlobalState(() => {
  const list = useLocalStorage<PracticeBooking[]>(
    'driving-school-practice-bookings-v5',
    () => seedPracticeBookings.map(r => ({ ...r })),
  )

  function submitBooking(input: { student_id: number, project_id: number, coach_id: number, remark?: string }) {
    const { dataList: projects, updateData: updateProject } = useTrainingProjectStore()
    const pi = projects.value.findIndex(p => p.id === input.project_id)
    if (pi < 0)
      return { ok: false, message: '练车项目不存在' }
    const proj = projects.value[pi]!
    if (proj.book_status === '已预约' || proj.status !== '可预约')
      return { ok: false, message: '该时段已被预约或不可选择' }
    if (proj.booked_num >= proj.max_num)
      return { ok: false, message: '该时段名额已满' }
    const dup = list.value.some(
      b => b.student_id === input.student_id && b.project_id === input.project_id && b.status !== '已驳回' && b.status !== '已取消',
    )
    if (dup)
      return { ok: false, message: '您已预约该项目，请勿重复提交' }
    const sameSlot = list.value.some((b) => {
      if (b.student_id !== input.student_id)
        return false
      if (b.status === '已驳回' || b.status === '已取消')
        return false
      const other = projects.value.find(x => x.id === b.project_id)
      if (!other)
        return false
      return other.train_date === proj.train_date && other.train_time === proj.train_time
    })
    if (sameSlot)
      return { ok: false, message: '您在该时段已有其他预约' }

    const row: PracticeBooking = {
      id: nextNumericId(list.value),
      project_id: input.project_id,
      student_id: input.student_id,
      coach_id: input.coach_id,
      appoint_date: proj.train_date,
      status: '待审核',
      remark: input.remark ?? '',
      check_remark: '',
      addtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    list.value = [...list.value, row]
    return { ok: true, message: '预约提交成功，请等待审核', booking: row }
  }

  function setStatus(bookingId: number, status: PracticeBooking['status'], check_remark?: string) {
    const i = list.value.findIndex(b => b.id === bookingId)
    if (i < 0)
      return false
    const b = list.value[i]!
    list.value[i] = { ...b, status, check_remark: check_remark ?? b.check_remark }
    list.value = [...list.value]

    const { dataList: projects, updateData: updateProject } = useTrainingProjectStore()
    const pi = projects.value.findIndex(p => p.id === b.project_id)
    if (pi < 0)
      return true
    const p = projects.value[pi]!

    if (status === '已通过') {
      updateProject(pi, {
        ...p,
        booked_num: Math.min(p.max_num, p.booked_num + 1),
        book_status: '已预约',
      })
    }
    if (status === '已驳回' || status === '已取消') {
      updateProject(pi, {
        ...p,
        booked_num: Math.max(0, p.booked_num - 1),
        book_status: p.booked_num <= 1 ? '可预约' : p.book_status,
      })
    }
    return true
  }

  function updateBooking(id: number, patch: Partial<PracticeBooking>) {
    const i = list.value.findIndex(b => b.id === id)
    if (i < 0)
      return false
    list.value[i] = { ...list.value[i]!, ...patch }
    list.value = [...list.value]
    return true
  }

  function removeBookings(ids: number[]) {
    const set = new Set(ids)
    list.value = list.value.filter(x => !set.has(x.id))
  }

  return { list, submitBooking, setStatus, updateBooking, removeBookings }
})

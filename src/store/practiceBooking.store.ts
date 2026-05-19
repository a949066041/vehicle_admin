import type { PracticeBooking } from '~/types/driving-school'
import { createGlobalState, useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { seedPracticeBookings } from '~/constants/back-office-list-seed'
import { nextNumericId } from '~/utils/driving-school'
import { useTrainingProjectStore } from './trainingProject.store'

export const usePracticeBookingStore = createGlobalState(() => {
  const list = useLocalStorage<PracticeBooking[]>(
    'driving-school-practice-bookings-v3',
    () => seedPracticeBookings.map(r => ({ ...r })),
  )

  function submitBooking(input: { student_id: number, project_id: number, coach_id: number, remark?: string }) {
    const { dataList: projects, updateData: updateProject } = useTrainingProjectStore()
    const pi = projects.value.findIndex(p => p.id === input.project_id)
    if (pi < 0)
      return { ok: false, message: '练车项目不存在' }
    const proj = projects.value[pi]!
    if (proj.status !== '可预约')
      return { ok: false, message: '该时段已被预约或不可选择' }
    if (proj.booked_num >= proj.max_num)
      return { ok: false, message: '该时段已被预约或不可选择' }
    const dup = list.value.some(
      b => b.student_id === input.student_id && b.project_id === input.project_id && b.status !== '已驳回' && b.status !== '已取消',
    )
    if (dup)
      return { ok: false, message: '您已预约该项目，请勿重复提交' }
    /** 论文：同一天同一时段只能预约一次（跨项目冲突检测） */
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
      addtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    list.value = [...list.value, row]
    updateProject(pi, { ...proj, booked_num: proj.booked_num + 1 })
    return { ok: true, message: '预约提交成功，请等待审核', booking: row }
  }

  function setStatus(bookingId: number, status: PracticeBooking['status'], remark?: string) {
    const i = list.value.findIndex(b => b.id === bookingId)
    if (i < 0)
      return false
    const b = list.value[i]!
    list.value[i] = { ...b, status, remark: remark ?? b.remark }
    list.value = [...list.value]
    if (status === '已驳回' || status === '已取消') {
      const { dataList: projects, updateData: updateProject } = useTrainingProjectStore()
      const pi = projects.value.findIndex(p => p.id === b.project_id)
      if (pi >= 0) {
        const p = projects.value[pi]!
        updateProject(pi, { ...p, booked_num: Math.max(0, p.booked_num - 1) })
      }
    }
    return true
  }

  return { list, submitBooking, setStatus }
})

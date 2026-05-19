import type { VehicleApplication } from '~/types/driving-school'
import { createGlobalState, useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { seedVehicleApplications } from '~/constants/back-office-list-seed'
import { nextNumericId } from '~/utils/driving-school'

export const useVehicleApplicationStore = createGlobalState(() => {
  const list = useLocalStorage<VehicleApplication[]>(
    'driving-school-vehicle-applies-v3',
    () => seedVehicleApplications.map(r => ({ ...r })),
  )

  function coachApply(input: {
    car_id: number
    coach_id: number
    usage_time?: string
    usage_desc?: string
  }) {
    const row: VehicleApplication = {
      id: nextNumericId(list.value),
      car_id: input.car_id,
      coach_id: input.coach_id,
      apply_date: dayjs().format('YYYY-MM-DD'),
      usage_time: input.usage_time ?? dayjs().format('M月D日'),
      usage_desc: input.usage_desc ?? '练车',
      status: '待审核',
      check_remark: '',
      addtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    list.value = [...list.value, row]
    return row
  }

  function setStatus(id: number, status: VehicleApplication['status'], check_remark?: string) {
    const i = list.value.findIndex(x => x.id === id)
    if (i < 0)
      return false
    list.value[i] = {
      ...list.value[i]!,
      status,
      check_remark: check_remark ?? list.value[i]!.check_remark,
    }
    list.value = [...list.value]
    return true
  }

  function updateApplication(id: number, patch: Partial<VehicleApplication>) {
    const i = list.value.findIndex(x => x.id === id)
    if (i < 0)
      return false
    list.value[i] = { ...list.value[i]!, ...patch }
    list.value = [...list.value]
    return true
  }

  function removeApplications(ids: number[]) {
    const set = new Set(ids)
    list.value = list.value.filter(x => !set.has(x.id))
  }

  return { list, coachApply, setStatus, updateApplication, removeApplications }
})

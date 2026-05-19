import type { Vehicle } from '~/types/driving-school'
import { createGlobalState } from '@vueuse/core'
import { useCurd } from '~/hooks'

const CAR_IMG = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=160&h=100&fit=crop'

const initData: Vehicle[] = [
  { id: 1, car_num: '冀F2398学', car_name: '捷达', car_type: 'C1', car_year: 2020, mileage: 1000, car_photo: CAR_IMG, status: '空闲' },
  { id: 2, car_num: '冀F2648学', car_name: '哪吒V', car_type: 'C2', car_year: 2025, mileage: 5478, car_photo: CAR_IMG, status: '已被申请' },
  { id: 3, car_num: '冀F5647学', car_name: '哪吒V', car_type: 'C2', car_year: 2024, mileage: 1546, car_photo: CAR_IMG, status: '已被申请' },
  { id: 4, car_num: '冀F3489学', car_name: '哪吒V', car_type: 'C2', car_year: 2023, mileage: 5242, car_photo: CAR_IMG, status: '已被申请' },
  { id: 5, car_num: '冀F3467学', car_name: '捷达', car_type: 'C1', car_year: 2020, mileage: 5082, car_photo: CAR_IMG, status: '空闲' },
  { id: 6, car_num: '冀F3458学', car_name: '桑塔纳', car_type: 'C1', car_year: 2019, mileage: 8205, car_photo: CAR_IMG, status: '空闲' },
  { id: 7, car_num: '冀F3492学', car_name: '哪吒EV', car_type: 'C2', car_year: 2023, mileage: 2156, car_photo: CAR_IMG, status: '已被申请' },
  { id: 8, car_num: '冀F3501学', car_name: '哪吒EV', car_type: 'C2', car_year: 2024, mileage: 980, car_photo: CAR_IMG, status: '空闲' },
]

export const useVehicleStore = createGlobalState(() => {
  return useCurd<Vehicle>({ key: 'driving-school-vehicles-v2', initData })
})

import type { Vehicle } from '~/types/driving-school'
import { createGlobalState } from '@vueuse/core'
import { VehicleStatus } from '~/constants/vehicle-status'
import { useCurd } from '~/hooks'

const CAR_IMG = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=160&h=100&fit=crop'
const CAR_IMG2 = 'https://images.unsplash.com/photo-1494976388531-d1058498beb5?w=160&h=100&fit=crop'
const CAR_IMG3 = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=160&h=100&fit=crop'

/** 与设计图 5.20 一致的冀 F 学牌车辆假数据 */
const initData: Vehicle[] = [
  { id: 1, car_num: '冀F2398学', car_name: '捷达', car_type: 'C1', car_year: 2020, mileage: 1000, car_photo: CAR_IMG, status: VehicleStatus.Applied },
  { id: 2, car_num: '冀F2648学', car_name: '哪吒V', car_type: 'C2', car_year: 2025, mileage: 5478, car_photo: CAR_IMG2, status: VehicleStatus.Applied },
  { id: 3, car_num: '冀F5647学', car_name: '哪吒V', car_type: 'C2', car_year: 2024, mileage: 1546, car_photo: CAR_IMG2, status: VehicleStatus.Applied },
  { id: 4, car_num: '冀F3489学', car_name: '哪吒V', car_type: 'C2', car_year: 2023, mileage: 5242, car_photo: CAR_IMG2, status: VehicleStatus.Applied },
  { id: 5, car_num: '冀F3467学', car_name: '捷达', car_type: 'C1', car_year: 2020, mileage: 5082, car_photo: CAR_IMG, status: VehicleStatus.Applied },
  { id: 6, car_num: '冀F3458学', car_name: '桑塔纳', car_type: 'C1', car_year: 2019, mileage: 8205, car_photo: CAR_IMG3, status: VehicleStatus.Idle },
  { id: 7, car_num: '冀F3492学', car_name: '哪吒EV', car_type: 'C2', car_year: 2023, mileage: 2156, car_photo: CAR_IMG2, status: VehicleStatus.Applied },
  { id: 8, car_num: '冀F3224学', car_name: '捷达', car_type: 'C2', car_year: 2023, mileage: 2542, car_photo: CAR_IMG, status: VehicleStatus.Idle },
  { id: 9, car_num: '冀F3512学', car_name: '比亚迪秦', car_type: 'C2', car_year: 2022, mileage: 3200, car_photo: CAR_IMG2, status: VehicleStatus.Idle },
  { id: 10, car_num: '冀F1467学', car_name: '捷达', car_type: 'C1', car_year: 2021, mileage: 5248, car_photo: CAR_IMG, status: VehicleStatus.Idle },
  { id: 11, car_num: '冀F3533学', car_name: '桑塔纳', car_type: 'C1', car_year: 2021, mileage: 4560, car_photo: CAR_IMG3, status: VehicleStatus.Idle },
  { id: 12, car_num: '冀F3541学', car_name: '哪吒V', car_type: 'C2', car_year: 2024, mileage: 1890, car_photo: CAR_IMG2, status: VehicleStatus.Applied },
  { id: 13, car_num: '冀F3556学', car_name: '大众朗逸', car_type: 'C1', car_year: 2022, mileage: 6780, car_photo: CAR_IMG, status: VehicleStatus.Idle },
  { id: 14, car_num: '冀F3568学', car_name: '比亚迪海豚', car_type: 'C2', car_year: 2023, mileage: 2100, car_photo: CAR_IMG2, status: VehicleStatus.Idle },
]

export const useVehicleStore = createGlobalState(() => {
  return useCurd<Vehicle>({ key: 'driving-school-vehicles-v4', initData })
})

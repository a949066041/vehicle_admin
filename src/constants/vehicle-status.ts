/** 车辆使用状态枚举（论文：空闲 / 已被申请） */
export enum VehicleStatus {
  Idle = '空闲',
  Applied = '已被申请',
}

export const VEHICLE_STATUS_OPTIONS = [
  { label: VehicleStatus.Idle, value: VehicleStatus.Idle },
  { label: VehicleStatus.Applied, value: VehicleStatus.Applied },
]

/** 是否空闲（可申请） */
export function isVehicleIdle(status: string) {
  return status === VehicleStatus.Idle
}

/** 教练端申请按钮是否可用 */
export function canApplyVehicle(status: string) {
  return isVehicleIdle(status)
}

export function vehicleStatusTagType(status: string): 'success' | 'warning' | 'default' {
  if (status === VehicleStatus.Idle)
    return 'success'
  if (status === VehicleStatus.Applied)
    return 'warning'
  return 'default'
}

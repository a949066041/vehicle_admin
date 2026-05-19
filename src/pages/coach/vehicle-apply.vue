<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { canApplyVehicle, VehicleStatus } from '~/constants/vehicle-status'
import { useLoginStore, useVehicleApplicationStore, useVehicleStore } from '~/store'

const message = useMessage()
const { currentProfile } = useLoginStore()
const { dataList: vehicles } = useVehicleStore()
const { list, coachApply } = useVehicleApplicationStore()

const cid = computed(() => currentProfile.value?.id ?? 0)
const mine = computed(() => list.value.filter(a => a.coach_id === cid.value))

function apply(carId: number) {
  if (!cid.value) {
    message.error('未登录')
    return
  }
  const v = vehicles.value.find(x => x.id === carId)
  if (!v || !canApplyVehicle(v.status)) {
    message.warning('该车辆当前不可申请')
    return
  }
  coachApply({ car_id: carId, coach_id: cid.value })
  message.success('申请已提交，待管理员审核')
}
</script>

<template>
  <div>
    <h3 class="mb-4 text-lg font-semibold">
      车辆申请（论文教练端）
    </h3>
    <p class="mb-4 text-sm text-slate-600">
      仅「{{ VehicleStatus.Idle }}」车辆可申请；「{{ VehicleStatus.Applied }}」时申请按钮自动禁用。
    </p>
    <n-space vertical>
      <n-card
        v-for="v in vehicles"
        :key="v.id"
        size="small"
        :title="`${v.car_name} · ${v.car_num}`"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="text-sm text-slate-600">
            {{ v.car_type }} · {{ v.car_year }}年 · 里程 {{ v.mileage ?? '-' }} km
          </div>
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium"
            :class="canApplyVehicle(v.status)
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700'"
          >
            {{ v.status }}
          </span>
        </div>
        <n-button
          class="mt-3"
          size="small"
          type="primary"
          :disabled="!canApplyVehicle(v.status)"
          @click="apply(v.id)"
        >
          {{ canApplyVehicle(v.status) ? '申请使用该车辆' : '车辆已被申请' }}
        </n-button>
      </n-card>
    </n-space>
    <n-divider>我的申请记录</n-divider>
    <n-list bordered>
      <n-list-item v-for="a in mine" :key="a.id">
        车辆 #{{ a.car_id }} · {{ a.status }} · {{ a.apply_date }}
      </n-list-item>
    </n-list>
  </div>
</template>

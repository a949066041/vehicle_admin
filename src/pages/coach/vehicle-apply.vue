<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { Vehicle } from '~/types/driving-school'
import { NTag, useMessage } from 'naive-ui'
import { h } from 'vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import CoachRowActions from '~/components/back/CoachRowActions.vue'
import { canApplyVehicle, VehicleStatus, vehicleStatusTagType } from '~/constants/vehicle-status'
import { useLoginStore, useVehicleApplicationStore, useVehicleStore } from '~/store'

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=160&h=100&fit=crop'

const message = useMessage()
const { currentProfile } = useLoginStore()
const { dataList: vehicles } = useVehicleStore()
const { list, coachApply } = useVehicleApplicationStore()

const cid = computed(() => currentProfile.value?.id ?? 0)
const mine = computed(() => list.value.filter(a => a.coach_id === cid.value))

const filterPlate = ref('')
const filterBrand = ref('')
const filterStatus = ref<string | null>(null)
const page = ref(1)
const showView = ref(false)
const viewing = ref<Vehicle | null>(null)

const statusOptions = [
  { label: VehicleStatus.Idle, value: VehicleStatus.Idle },
  { label: VehicleStatus.Applied, value: VehicleStatus.Applied },
]

const filteredList = computed(() => {
  return vehicles.value.filter((row) => {
    if (filterPlate.value && !row.car_num.includes(filterPlate.value.trim()))
      return false
    if (filterBrand.value && !row.car_name.includes(filterBrand.value.trim()))
      return false
    if (filterStatus.value && row.status !== filterStatus.value)
      return false
    return true
  })
})

const tableData = computed(() => {
  const start = (page.value - 1) * 10
  return filteredList.value.slice(start, start + 10)
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredList.value.length / 10)))

function rowIndex(index: number) {
  return (page.value - 1) * 10 + index + 1
}

function renderPhoto(row: Vehicle) {
  const src = row.car_photo || DEFAULT_PHOTO
  return h('img', {
    src,
    class: 'h-12 w-[88px] rounded object-cover border border-slate-200',
    alt: row.car_num,
  })
}

function renderStatus(status: string) {
  return h(NTag, { size: 'small', bordered: false, type: vehicleStatusTagType(status) }, { default: () => status })
}

function onView(row: Vehicle) {
  viewing.value = row
  showView.value = true
}

function apply(row: Vehicle) {
  if (!cid.value) {
    message.error('未登录')
    return
  }
  if (!canApplyVehicle(row.status)) {
    message.warning('仅「空闲」车辆可申请')
    return
  }
  coachApply({ car_id: row.id, coach_id: cid.value })
  message.success('车辆申请已提交，请等待管理员审核')
}

function onSearch() {
  page.value = 1
}

const columns: DataTableColumns<Vehicle> = [
  { title: '序号', key: 'index', width: 64, render: (_r, i) => rowIndex(i) },
  { title: '车牌号', key: 'car_num', width: 118, ellipsis: { tooltip: true } },
  { title: '品牌', key: 'car_name', width: 100 },
  { title: '驾照类型', key: 'car_type', width: 88 },
  { title: '年份', key: 'car_year', width: 72, render: r => r.car_year ?? '-' },
  { title: '里程数', key: 'mileage', width: 88, render: r => r.mileage ?? '-' },
  { title: '状态', key: 'status', width: 100, render: r => renderStatus(r.status) },
  { title: '车辆图片', key: 'car_photo', width: 100, render: r => renderPhoto(r) },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
    render: row => h(CoachRowActions, {
      showDelete: false,
      showApply: true,
      applyDisabled: !canApplyVehicle(row.status),
      onView: () => onView(row),
      onApply: () => apply(row),
    }),
  },
]
</script>

<template>
  <div class="back-list-page">
    <h3 class="mb-3 text-lg font-semibold text-slate-800">
      车辆申请
    </h3>
    <p class="mb-4 text-sm text-slate-600">
      查看全部教练车状态，仅可对「{{ VehicleStatus.Idle }}」车辆提交申请，审核通过后方可使用。
    </p>
    <BackListToolbar hide-add hide-delete @search="onSearch">
      <template #filters>
        <n-input v-model:value="filterPlate" placeholder="车牌号" clearable />
        <n-input v-model:value="filterBrand" placeholder="品牌" clearable />
        <n-select v-model:value="filterStatus" placeholder="车辆状态" clearable :options="statusOptions" />
      </template>
    </BackListToolbar>
    <n-data-table
      :columns="columns"
      :data="tableData"
      :row-key="(r: Vehicle) => r.id"
      bordered
      size="small"
      scroll-x="1000"
      striped
      :pagination="{ page, pageCount, onUpdatePage: (p: number) => (page = p) }"
    />
    <n-divider class="!my-6">
      我的申请记录
    </n-divider>
    <n-data-table
      v-if="mine.length"
      size="small"
      bordered
      :columns="[
        { title: '车辆ID', key: 'car_id', width: 80 },
        { title: '申请日期', key: 'apply_date', width: 110 },
        { title: '使用时间', key: 'usage_time', width: 100 },
        { title: '用途', key: 'usage_desc', width: 100 },
        { title: '审核状态', key: 'status', width: 100 },
        { title: '审核回复', key: 'check_remark', ellipsis: { tooltip: true } },
      ]"
      :data="mine"
      :row-key="(r) => r.id"
    />
    <n-empty v-else description="暂无车辆申请记录" class="py-6" />

    <BackCrudModal v-model:show="showView" title="查看车辆" @confirm="showView = false" @cancel="showView = false">
      <n-descriptions v-if="viewing" :column="1" bordered size="small" label-placement="left">
        <n-descriptions-item label="车牌号">
          {{ viewing.car_num }}
        </n-descriptions-item>
        <n-descriptions-item label="品牌">
          {{ viewing.car_name }}
        </n-descriptions-item>
        <n-descriptions-item label="驾照类型">
          {{ viewing.car_type }}
        </n-descriptions-item>
        <n-descriptions-item label="年份">
          {{ viewing.car_year }}
        </n-descriptions-item>
        <n-descriptions-item label="里程">
          {{ viewing.mileage }} km
        </n-descriptions-item>
        <n-descriptions-item label="状态">
          {{ viewing.status }}
        </n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end" class="w-full">
          <n-button type="primary" @click="showView = false">
            关闭
          </n-button>
        </n-space>
      </template>
    </BackCrudModal>
  </div>
</template>

<style scoped>
.back-list-page :deep(.n-data-table-th) {
  font-weight: 600;
  background: #f5f7fa !important;
}
</style>

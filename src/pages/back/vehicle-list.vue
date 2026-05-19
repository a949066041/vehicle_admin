<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { Vehicle } from '~/types/driving-school'
import { NTag, useMessage } from 'naive-ui'
import dayjs from 'dayjs'
import { h } from 'vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import {
  VEHICLE_STATUS_OPTIONS,
  VehicleStatus,
  vehicleStatusTagType,
} from '~/constants/vehicle-status'
import { useVehicleStore } from '~/store'
import { nextNumericId } from '~/utils/driving-school'

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=160&h=100&fit=crop'

const message = useMessage()
const store = useVehicleStore()
const {
  dataList,
  page,
  onUpdatePage,
  removeData,
  openModalState,
  openModal,
  updateTitle,
  closeModal,
  changeModal,
  saveForm,
  isUpdate,
} = store

const filterPlate = ref('')
const filterBrand = ref('')
const filterStatus = ref<string | null>(null)
const checkedRowKeys = ref<Array<string | number>>([])
const viewOnly = ref(false)

const carTypeOptions = [
  { label: 'C1', value: 'C1' },
  { label: 'C2', value: 'C2' },
]

const filteredList = computed(() => {
  return dataList.value.filter((row) => {
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

const modalTitle = computed(() => {
  if (viewOnly.value)
    return '查看车辆'
  return isUpdate.value ? '修改车辆' : '发布车辆'
})

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
  return h(
    NTag,
    {
      size: 'small',
      bordered: false,
      type: vehicleStatusTagType(status),
    },
    { default: () => status },
  )
}

function findIndex(row: Vehicle) {
  return dataList.value.findIndex(r => r.id === row.id)
}

function onView(row: Vehicle) {
  viewOnly.value = true
  openModal(row, findIndex(row))
}

function onEdit(row: Vehicle) {
  viewOnly.value = false
  openModal(row, findIndex(row))
}

function onDelete(row: Vehicle) {
  removeData(findIndex(row))
  message.success('已删除')
}

function onAdd() {
  viewOnly.value = false
  openModal({
    car_name: '捷达',
    car_type: 'C1',
    car_num: '',
    car_year: 2024,
    mileage: 0,
    car_photo: DEFAULT_PHOTO,
    status: VehicleStatus.Idle,
  } as Vehicle)
}

function onBatchDelete() {
  if (!checkedRowKeys.value.length) {
    message.warning('请先勾选要删除的记录')
    return
  }
  const ids = new Set(checkedRowKeys.value)
  dataList.value = dataList.value.filter(r => !ids.has(r.id))
  checkedRowKeys.value = []
  message.success('已删除选中记录')
}

function confirmSave() {
  if (viewOnly.value) {
    closeModal()
    return
  }
  if (!changeModal.value.car_num?.trim()) {
    message.warning('请填写车牌号')
    return
  }
  if (!changeModal.value.car_name?.trim()) {
    message.warning('请填写品牌')
    return
  }
  if (!isUpdate.value) {
    changeModal.value.id = nextNumericId(dataList.value)
    changeModal.value.status = changeModal.value.status ?? VehicleStatus.Idle
    changeModal.value.addtime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  changeModal.value.car_year = Number(changeModal.value.car_year) || 0
  changeModal.value.mileage = Number(changeModal.value.mileage) || 0
  changeModal.value.car_photo = (changeModal.value.car_photo ?? '').trim() || DEFAULT_PHOTO
  saveForm()
  message.success(isUpdate.value ? '已保存修改' : '车辆已发布')
}

function onSearch() {
  page.value = 1
}

const columns: DataTableColumns<Vehicle> = [
  { type: 'selection' },
  {
    title: '序号',
    key: 'index',
    width: 64,
    render: (_row, index) => rowIndex(index),
  },
  {
    title: '车牌号',
    key: 'car_num',
    width: 118,
    ellipsis: { tooltip: true },
  },
  {
    title: '品牌',
    key: 'car_name',
    width: 100,
    ellipsis: { tooltip: true },
  },
  {
    title: '驾照类型',
    key: 'car_type',
    width: 88,
  },
  {
    title: '年份',
    key: 'car_year',
    width: 72,
    sorter: (a, b) => (a.car_year ?? 0) - (b.car_year ?? 0),
    render: row => row.car_year ?? '-',
  },
  {
    title: '里程数',
    key: 'mileage',
    width: 88,
    sorter: (a, b) => (a.mileage ?? 0) - (b.mileage ?? 0),
    render: row => row.mileage ?? '-',
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: row => renderStatus(row.status),
  },
  {
    title: '车辆图片',
    key: 'car_photo',
    width: 100,
    render: row => renderPhoto(row),
  },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
    render: (row) => {
      return h(BackRowActions, {
        showEdit: true,
        onView: () => onView(row),
        onEdit: () => onEdit(row),
        onDelete: () => onDelete(row),
      })
    },
  },
]
</script>

<template>
  <div class="back-list-page">
    <BackListToolbar
      @add="onAdd"
      @batch-delete="onBatchDelete"
      @search="onSearch"
    >
      <template #filters>
        <n-input v-model:value="filterPlate" placeholder="车牌号" clearable />
        <n-input v-model:value="filterBrand" placeholder="品牌" clearable />
        <n-select
          v-model:value="filterStatus"
          placeholder="车辆状态"
          clearable
          :options="VEHICLE_STATUS_OPTIONS"
        />
      </template>
    </BackListToolbar>

    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="tableData"
      :row-key="(row: Vehicle) => row.id"
      :bordered="true"
      :single-line="false"
      size="small"
      scroll-x="1200"
      striped
      class="back-data-table"
      :pagination="{
        page,
        pageCount,
        onUpdatePage,
      }"
    />

    <BackCrudModal
      v-model:show="openModalState"
      :title="modalTitle"
      card-class="!max-w-[520px]"
      @confirm="confirmSave"
      @cancel="closeModal"
    >
      <n-form :model="changeModal" label-width="96px">
        <n-form-item label="车牌号" required>
          <n-input v-model:value="changeModal.car_num" :disabled="viewOnly" placeholder="如 冀F3467学" />
        </n-form-item>
        <n-form-item label="品牌" required>
          <n-input v-model:value="changeModal.car_name" :disabled="viewOnly" placeholder="如 捷达" />
        </n-form-item>
        <n-form-item label="驾照类型">
          <n-select
            v-model:value="changeModal.car_type"
            :disabled="viewOnly"
            :options="carTypeOptions"
          />
        </n-form-item>
        <n-form-item label="年份">
          <n-input-number v-model:value="changeModal.car_year" class="w-full" :min="2000" :max="2030" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="里程数">
          <n-input-number v-model:value="changeModal.mileage" class="w-full" :min="0" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select
            v-model:value="changeModal.status"
            :disabled="viewOnly"
            :options="VEHICLE_STATUS_OPTIONS"
          />
        </n-form-item>
        <n-form-item label="车辆图片">
          <n-input v-model:value="changeModal.car_photo" :disabled="viewOnly" placeholder="图片 URL" />
        </n-form-item>
      </n-form>
      <template v-if="viewOnly" #footer>
        <n-space justify="end" class="w-full">
          <n-button type="primary" @click="closeModal">
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

.back-list-page :deep(.n-data-table-td) {
  vertical-align: middle;
}
</style>

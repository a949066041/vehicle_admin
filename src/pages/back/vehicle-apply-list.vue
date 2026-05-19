<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { VehicleApplication } from '~/types/driving-school'
import { NTag, useMessage } from 'naive-ui'
import { h } from 'vue'
import BackApplyToolbar from '~/components/back/BackApplyToolbar.vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import { useCoachStore, useVehicleApplicationStore, useVehicleStore } from '~/store'
import { VehicleStatus } from '~/constants/vehicle-status'
import { auditStatusLabel } from '~/utils/h5-booking'

const message = useMessage()
const { list, setStatus, updateApplication, removeApplications } = useVehicleApplicationStore()
const { dataList: vehicles } = useVehicleStore()
const { dataList: coaches } = useCoachStore()

const filterPlate = ref('')
const filterBrand = ref('')
const filterStatus = ref<string | null>(null)
const checkedRowKeys = ref<Array<string | number>>([])
const page = ref(1)

const showAudit = ref(false)
const showView = ref(false)
const showEdit = ref(false)
const auditIds = ref<number[]>([])
const auditStatus = ref<string | null>(null)
const auditRemark = ref('')
const viewing = ref<VehicleApplication | null>(null)
const editing = ref<VehicleApplication | null>(null)
const editUsageTime = ref('')
const editUsageDesc = ref('')

const statusFilterOptions = [
  { label: '待审核', value: '待审核' },
  { label: '通过', value: '已通过' },
  { label: '不通过', value: '已驳回' },
]

const auditStatusOptions = [
  { label: '通过', value: '已通过' },
  { label: '不通过', value: '已驳回' },
  { label: '待审核', value: '待审核' },
]

function vehicleOf(carId: number) {
  return vehicles.value.find(v => v.id === carId)
}

function coachOf(coachId: number) {
  return coaches.value.find(c => c.id === coachId)
}

function coachJobNo(coachId: number) {
  const c = coachOf(coachId)
  if (!c)
    return String(coachId).padStart(3, '0')
  const m = c.username.match(/(\d+)$/)
  return m ? m[1]!.padStart(3, '0') : String(coachId).padStart(3, '0')
}

function statusTagType(status: string): 'warning' | 'success' | 'error' | 'default' {
  if (status === '待审核')
    return 'warning'
  if (status === '已通过')
    return 'success'
  if (status === '已驳回')
    return 'error'
  return 'default'
}

function renderStatus(status: string) {
  return h(
    NTag,
    {
      size: 'small',
      bordered: false,
      type: statusTagType(status),
    },
    { default: () => auditStatusLabel(status) },
  )
}

function renderCarPhoto(carId: number) {
  const v = vehicleOf(carId)
  const src = v?.car_photo || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=160&h=100&fit=crop'
  return h('img', {
    src,
    class: 'h-12 w-[72px] rounded object-cover border border-slate-200',
    alt: v?.car_num ?? '车辆',
  })
}

const filteredList = computed(() => {
  return list.value.filter((row) => {
    const v = vehicleOf(row.car_id)
    if (filterPlate.value && !(v?.car_num ?? '').includes(filterPlate.value.trim()))
      return false
    if (filterBrand.value && !(v?.car_name ?? '').includes(filterBrand.value.trim()))
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

function onSearch() {
  page.value = 1
}

function syncVehicleOnApprove(carId: number, status: string) {
  if (status !== '已通过')
    return
  const i = vehicles.value.findIndex(v => v.id === carId)
  if (i >= 0)
    vehicles.value[i] = { ...vehicles.value[i]!, status: VehicleStatus.Applied }
}

function openAudit(ids: number[]) {
  if (!ids.length) {
    message.warning('请先勾选要审核的记录')
    return
  }
  auditIds.value = ids
  const first = list.value.find(r => r.id === ids[0])
  auditStatus.value = first?.status === '已通过' || first?.status === '已驳回'
    ? first.status
    : '已通过'
  auditRemark.value = first?.check_remark ?? ''
  showAudit.value = true
}

function onBatchAudit() {
  openAudit(checkedRowKeys.value.map(Number))
}

function onBatchDelete() {
  if (!checkedRowKeys.value.length) {
    message.warning('请先勾选要删除的记录')
    return
  }
  removeApplications(checkedRowKeys.value.map(Number))
  checkedRowKeys.value = []
  message.success('已删除选中记录')
}

function confirmAudit() {
  if (!auditStatus.value) {
    message.warning('请选择审核状态')
    return
  }
  if (!auditRemark.value.trim()) {
    message.warning('请填写审核内容')
    return
  }
  const remark = auditRemark.value.trim()
  for (const id of auditIds.value) {
    const row = list.value.find(r => r.id === id)
    if (!row)
      continue
    setStatus(id, auditStatus.value, remark)
    syncVehicleOnApprove(row.car_id, auditStatus.value)
  }
  showAudit.value = false
  checkedRowKeys.value = []
  message.success('审核已保存')
}

function onView(row: VehicleApplication) {
  viewing.value = row
  showView.value = true
}

function onEdit(row: VehicleApplication) {
  editing.value = row
  editUsageTime.value = row.usage_time ?? ''
  editUsageDesc.value = row.usage_desc ?? ''
  showEdit.value = true
}

function confirmEdit() {
  if (!editing.value)
    return
  if (!editUsageTime.value.trim() || !editUsageDesc.value.trim()) {
    message.warning('请填写使用时间与使用说明')
    return
  }
  updateApplication(editing.value.id, {
    usage_time: editUsageTime.value.trim(),
    usage_desc: editUsageDesc.value.trim(),
  })
  showEdit.value = false
  message.success('已保存')
}

function onDelete(row: VehicleApplication) {
  removeApplications([row.id])
  message.success('已删除')
}

const columns: DataTableColumns<VehicleApplication> = [
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
    width: 110,
    render: row => vehicleOf(row.car_id)?.car_num ?? '-',
  },
  {
    title: '品牌',
    key: 'car_name',
    width: 88,
    render: row => vehicleOf(row.car_id)?.car_name ?? '-',
  },
  {
    title: '车型',
    key: 'car_type',
    width: 72,
    render: row => vehicleOf(row.car_id)?.car_type ?? '-',
  },
  {
    title: '年份',
    key: 'car_year',
    width: 72,
    render: row => vehicleOf(row.car_id)?.car_year ?? '-',
  },
  {
    title: '里程数',
    key: 'mileage',
    width: 88,
    sorter: (a, b) => (vehicleOf(a.car_id)?.mileage ?? 0) - (vehicleOf(b.car_id)?.mileage ?? 0),
    render: row => vehicleOf(row.car_id)?.mileage ?? '-',
  },
  {
    title: '车辆图片',
    key: 'car_photo',
    width: 96,
    render: row => renderCarPhoto(row.car_id),
  },
  {
    title: '使用时间',
    key: 'usage_time',
    width: 96,
    render: row => row.usage_time || row.apply_date,
  },
  {
    title: '使用说明',
    key: 'usage_desc',
    width: 110,
    ellipsis: { tooltip: true },
    render: row => row.usage_desc || '-',
  },
  {
    title: '教练工号',
    key: 'coach_no',
    width: 88,
    render: row => coachJobNo(row.coach_id),
  },
  {
    title: '教练姓名',
    key: 'coach_name',
    width: 96,
    render: row => coachOf(row.coach_id)?.name ?? '-',
  },
  {
    title: '审核回复',
    key: 'check_remark',
    minWidth: 120,
    ellipsis: { tooltip: true },
    render: row => row.check_remark || '-',
  },
  {
    title: '审核状态',
    key: 'status',
    width: 96,
    render: row => renderStatus(row.status),
  },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
    render: (row) => {
      return h(BackRowActions, {
        showEdit: row.status === '待审核',
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
    <BackApplyToolbar
      @batch-delete="onBatchDelete"
      @audit="onBatchAudit"
      @search="onSearch"
    >
      <template #filters>
        <n-input v-model:value="filterPlate" placeholder="车牌号" clearable />
        <n-input v-model:value="filterBrand" placeholder="品牌" clearable />
        <n-select
          v-model:value="filterStatus"
          placeholder="是否通过"
          clearable
          :options="statusFilterOptions"
        />
      </template>
    </BackApplyToolbar>

    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="tableData"
      :row-key="(row: VehicleApplication) => row.id"
      :bordered="true"
      :single-line="false"
      size="small"
      scroll-x="1600"
      striped
      class="back-data-table"
      :pagination="{
        page,
        pageCount,
        onUpdatePage: (p: number) => (page = p),
      }"
    />

    <BackCrudModal
      v-model:show="showAudit"
      title="审核"
      card-class="!max-w-[480px]"
      @confirm="confirmAudit"
      @cancel="showAudit = false"
    >
      <n-form label-width="96px">
        <n-form-item label="审核状态" required>
          <n-select v-model:value="auditStatus" :options="auditStatusOptions" placeholder="请选择" />
        </n-form-item>
        <n-form-item label="内容" required>
          <n-input
            v-model:value="auditRemark"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
          />
        </n-form-item>
      </n-form>
    </BackCrudModal>

    <BackCrudModal
      v-model:show="showView"
      title="查看申请"
      card-class="!max-w-[520px]"
      @confirm="showView = false"
      @cancel="showView = false"
    >
      <n-descriptions v-if="viewing" :column="1" label-placement="left" bordered size="small">
        <n-descriptions-item label="车牌号">
          {{ vehicleOf(viewing.car_id)?.car_num }}
        </n-descriptions-item>
        <n-descriptions-item label="品牌">
          {{ vehicleOf(viewing.car_id)?.car_name }}
        </n-descriptions-item>
        <n-descriptions-item label="车型">
          {{ vehicleOf(viewing.car_id)?.car_type }}
        </n-descriptions-item>
        <n-descriptions-item label="使用时间">
          {{ viewing.usage_time || viewing.apply_date }}
        </n-descriptions-item>
        <n-descriptions-item label="使用说明">
          {{ viewing.usage_desc || '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="教练">
          {{ coachOf(viewing.coach_id)?.name }}（{{ coachJobNo(viewing.coach_id) }}）
        </n-descriptions-item>
        <n-descriptions-item label="审核状态">
          {{ auditStatusLabel(viewing.status) }}
        </n-descriptions-item>
        <n-descriptions-item label="审核回复">
          {{ viewing.check_remark || '-' }}
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

    <BackCrudModal
      v-model:show="showEdit"
      title="修改申请"
      card-class="!max-w-[480px]"
      @confirm="confirmEdit"
      @cancel="showEdit = false"
    >
      <n-form label-width="96px">
        <n-form-item label="使用时间" required>
          <n-input v-model:value="editUsageTime" placeholder="如 5月15日" />
        </n-form-item>
        <n-form-item label="使用说明" required>
          <n-input v-model:value="editUsageDesc" placeholder="如 练车" />
        </n-form-item>
      </n-form>
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

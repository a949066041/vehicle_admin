<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { TrainingProject } from '~/types/driving-school'
import { NTag, useMessage } from 'naive-ui'
import { h } from 'vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import { useCoachStore, useSiteStore, useTrainingProjectStore, useVehicleStore } from '~/store'
import { PRACTICE_PHOTO } from '~/utils/back-audit'
import { coachWorkNo } from '~/utils/h5-booking'
import { nextNumericId } from '~/utils/driving-school'

const message = useMessage()
const store = useTrainingProjectStore()
const { dataList: coaches } = useCoachStore()
const { dataList: sites } = useSiteStore()
const { dataList: vehicles } = useVehicleStore()
const {
  dataList,
  page,
  onUpdatePage,
  removeData,
  openModalState,
  openModal,
  closeModal,
  changeModal,
  saveForm,
  isUpdate,
} = store

const filterSubject = ref('')
const filterSite = ref('')
const filterBookStatus = ref<string | null>(null)
const checkedRowKeys = ref<Array<string | number>>([])
const viewOnly = ref(false)

const bookStatusOptions = [
  { label: '可预约', value: '可预约' },
  { label: '已预约', value: '已预约' },
]

const filteredList = computed(() => {
  return dataList.value.filter((row) => {
    if (filterSubject.value && !row.subject.includes(filterSubject.value.trim()))
      return false
    const site = sites.value.find(s => s.id === row.site_id)
    if (filterSite.value && !(site?.site_name ?? '').includes(filterSite.value.trim()))
      return false
    if (filterBookStatus.value && row.book_status !== filterBookStatus.value)
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
    return '查看练车项目'
  return isUpdate.value ? '修改练车项目' : '发布练车项目'
})

function rowIndex(index: number) {
  return (page.value - 1) * 10 + index + 1
}

function siteName(id: number) {
  return sites.value.find(s => s.id === id)?.site_name ?? '-'
}

function coachName(id: number) {
  const c = coaches.value.find(x => x.id === id)
  return c?.name ?? '-'
}

function coachNo(id: number) {
  const c = coaches.value.find(x => x.id === id)
  return c ? coachWorkNo(c.username, c.id) : '-'
}

function carPlate(carId?: number) {
  if (!carId)
    return '-'
  return vehicles.value.find(v => v.id === carId)?.car_num ?? '-'
}

function renderPhoto(row: TrainingProject) {
  const src = row.practice_photo || PRACTICE_PHOTO
  return h('img', { src, class: 'h-12 w-12 rounded object-cover border border-slate-200', alt: '练车' })
}

function renderBookStatus(status?: string) {
  const s = status ?? '可预约'
  return h(NTag, { size: 'small', bordered: false, type: s === '已预约' ? 'warning' : 'success' }, { default: () => s })
}

function findIndex(row: TrainingProject) {
  return dataList.value.findIndex(r => r.id === row.id)
}

function onView(row: TrainingProject) {
  viewOnly.value = true
  openModal(row, findIndex(row))
}

function onEdit(row: TrainingProject) {
  viewOnly.value = false
  openModal(row, findIndex(row))
}

function onDelete(row: TrainingProject) {
  removeData(findIndex(row))
  message.success('已删除')
}

function onAdd() {
  viewOnly.value = false
  openModal({
    subject: '科二',
    car_type: 'C2',
    site_id: sites.value[0]?.id ?? 1,
    coach_id: coaches.value[0]?.id ?? 1,
    car_id: vehicles.value[0]?.id ?? 1,
    train_date: '2025-05-15',
    train_time: '9:00-10:00',
    max_num: 1,
    booked_num: 0,
    status: '可预约',
    book_status: '可预约',
    practice_photo: PRACTICE_PHOTO,
    comment_num: 0,
    favorite_num: 0,
  } as TrainingProject)
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
  if (!isUpdate.value) {
    changeModal.value.id = nextNumericId(dataList.value)
    changeModal.value.booked_num = changeModal.value.booked_num ?? 0
    changeModal.value.status = changeModal.value.status ?? '可预约'
    changeModal.value.book_status = changeModal.value.book_status ?? '可预约'
    changeModal.value.comment_num = changeModal.value.comment_num ?? 0
    changeModal.value.favorite_num = changeModal.value.favorite_num ?? 0
  }
  changeModal.value.practice_photo = (changeModal.value.practice_photo ?? '').trim() || PRACTICE_PHOTO
  saveForm()
  message.success(isUpdate.value ? '已保存' : '练车项目已发布')
}

function onSearch() {
  page.value = 1
}

const columns: DataTableColumns<TrainingProject> = [
  { type: 'selection' },
  { title: '序号', key: 'index', width: 64, render: (_r, i) => rowIndex(i) },
  { title: '练车科目', key: 'subject', width: 88 },
  { title: '练车车型', key: 'car_type', width: 88 },
  { title: '练车场地', key: 'site_id', width: 130, ellipsis: { tooltip: true }, render: r => siteName(r.site_id) },
  { title: '练车日期', key: 'train_date', width: 110, sorter: (a, b) => a.train_date.localeCompare(b.train_date) },
  { title: '练车时间', key: 'train_time', width: 110 },
  { title: '预约状态', key: 'book_status', width: 96, render: r => renderBookStatus(r.book_status) },
  { title: '练车图片', key: 'practice_photo', width: 80, render: r => renderPhoto(r) },
  { title: '教练工号', key: 'coach_no', width: 88, render: r => coachNo(r.coach_id) },
  { title: '教练姓名', key: 'coach_id', width: 96, render: r => coachName(r.coach_id) },
  { title: '车牌号', key: 'car_id', width: 110, render: r => carPlate(r.car_id) },
  { title: '评论数', key: 'comment_num', width: 80, render: r => r.comment_num ?? 0 },
  { title: '收藏数', key: 'favorite_num', width: 80, render: r => r.favorite_num ?? 0 },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
    render: row => h(BackRowActions, { onView: () => onView(row), onEdit: () => onEdit(row), onDelete: () => onDelete(row) }),
  },
]
</script>

<template>
  <div class="back-list-page">
    <BackListToolbar @add="onAdd" @batch-delete="onBatchDelete" @search="onSearch">
      <template #filters>
        <n-input v-model:value="filterSubject" placeholder="练车科目" clearable />
        <n-input v-model:value="filterSite" placeholder="练车场地" clearable />
        <n-select v-model:value="filterBookStatus" placeholder="预约状态" clearable :options="bookStatusOptions" />
      </template>
    </BackListToolbar>
    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="tableData"
      :row-key="(row: TrainingProject) => row.id"
      bordered
      size="small"
      scroll-x="1500"
      striped
      :pagination="{ page, pageCount, onUpdatePage }"
    />
    <BackCrudModal v-model:show="openModalState" :title="modalTitle" card-class="!max-w-[600px]" @confirm="confirmSave" @cancel="closeModal">
      <n-form :model="changeModal" label-width="100px">
        <n-form-item label="项目名称">
          <n-input v-model:value="changeModal.project_name" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="练车科目">
          <n-input v-model:value="changeModal.subject" :disabled="viewOnly" placeholder="如 科二" />
        </n-form-item>
        <n-form-item label="练车车型">
          <n-select v-model:value="changeModal.car_type" :disabled="viewOnly" :options="[{ label: 'C1', value: 'C1' }, { label: 'C2', value: 'C2' }]" />
        </n-form-item>
        <n-form-item label="教练">
          <n-select v-model:value="changeModal.coach_id" :disabled="viewOnly" :options="coaches.map(c => ({ label: c.name, value: c.id }))" />
        </n-form-item>
        <n-form-item label="场地">
          <n-select v-model:value="changeModal.site_id" :disabled="viewOnly" :options="sites.map(s => ({ label: s.site_name, value: s.id }))" />
        </n-form-item>
        <n-form-item label="车辆">
          <n-select v-model:value="changeModal.car_id" :disabled="viewOnly" :options="vehicles.map(v => ({ label: v.car_num, value: v.id }))" />
        </n-form-item>
        <n-form-item label="练车日期">
          <n-input v-model:value="changeModal.train_date" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="练车时间">
          <n-input v-model:value="changeModal.train_time" :disabled="viewOnly" placeholder="9:00-10:00" />
        </n-form-item>
        <n-form-item label="预约状态">
          <n-select v-model:value="changeModal.book_status" :disabled="viewOnly" :options="bookStatusOptions" />
        </n-form-item>
        <n-form-item label="可约人数">
          <n-input-number v-model:value="changeModal.max_num" class="w-full" :min="1" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="图片URL">
          <n-input v-model:value="changeModal.practice_photo" :disabled="viewOnly" />
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
.back-list-page :deep(.n-data-table-th) { font-weight: 600; background: #f5f7fa !important; }
</style>

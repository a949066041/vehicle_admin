<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { ExamInfo } from '~/types/driving-school'
import { useMessage } from 'naive-ui'
import { h } from 'vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import { useExamInfoStore } from '~/store'
import { EXAM_PHOTO } from '~/utils/back-audit'
import { nextNumericId } from '~/utils/driving-school'

const message = useMessage()
const store = useExamInfoStore()
const { dataList, page, onUpdatePage, removeData, openModalState, openModal, closeModal, changeModal, saveForm, isUpdate } = store

const filterSubject = ref('')
const filterType = ref('')
const checkedRowKeys = ref<Array<string | number>>([])
const viewOnly = ref(false)

const examTypeOptions = [
  { label: '正式考试', value: '正式考试' },
  { label: '模拟考试', value: '模拟考试' },
]

const filteredList = computed(() => dataList.value.filter((row) => {
  if (filterSubject.value && !row.exam_subject.includes(filterSubject.value.trim())) return false
  if (filterType.value && row.exam_type !== filterType.value) return false
  return true
}))
const tableData = computed(() => filteredList.value.slice((page.value - 1) * 10, page.value * 10))
const pageCount = computed(() => Math.max(1, Math.ceil(filteredList.value.length / 10)))
const modalTitle = computed(() => viewOnly.value ? '查看考试' : (isUpdate.value ? '修改考试' : '发布考试'))
function rowIndex(i: number) { return (page.value - 1) * 10 + i + 1 }
function findIndex(row: ExamInfo) { return dataList.value.findIndex(r => r.id === row.id) }

function renderPhoto(row: ExamInfo) {
  return h('img', { src: row.exam_photo || EXAM_PHOTO, class: 'h-12 w-12 rounded object-cover border border-slate-200', alt: '' })
}

function onAdd() {
  viewOnly.value = false
  openModal({ exam_name: '考试', exam_subject: '科一', exam_type: '正式考试', exam_address: '定兴明城考场', exam_date: '4月10日', max_num: 8, booked_num: 0, status: '可预约', exam_photo: EXAM_PHOTO } as ExamInfo)
}

function onBatchDelete() {
  if (!checkedRowKeys.value.length) { message.warning('请先勾选'); return }
  const ids = new Set(checkedRowKeys.value)
  dataList.value = dataList.value.filter(r => !ids.has(r.id))
  checkedRowKeys.value = []
  message.success('已删除')
}

function onSearch() {
  page.value = 1
}

function confirmSave() {
  if (viewOnly.value) { closeModal(); return }
  if (!isUpdate.value) {
    changeModal.value.id = nextNumericId(dataList.value)
    changeModal.value.booked_num = changeModal.value.booked_num ?? 0
    changeModal.value.status = changeModal.value.status ?? '可预约'
  }
  changeModal.value.exam_photo = (changeModal.value.exam_photo ?? '').trim() || EXAM_PHOTO
  if (changeModal.value.booked_num! >= changeModal.value.max_num!) changeModal.value.status = '已满'
  saveForm()
  message.success(isUpdate.value ? '已保存' : '考试信息已发布')
}

const columns: DataTableColumns<ExamInfo> = [
  { type: 'selection' },
  { title: '序号', key: 'i', width: 64, render: (_r, i) => rowIndex(i) },
  { title: '考试科目', key: 'exam_subject', width: 96 },
  { title: '考试形式', key: 'exam_type', width: 110 },
  { title: '地点', key: 'exam_address', width: 140, ellipsis: { tooltip: true } },
  { title: '日期', key: 'exam_date', width: 96 },
  { title: '已约人数', key: 'booked_num', width: 96, sorter: (a, b) => a.booked_num - b.booked_num },
  { title: '图片', key: 'exam_photo', width: 80, render: r => renderPhoto(r) },
  { title: '可约人数', key: 'max_num', width: 96, sorter: (a, b) => a.max_num - b.max_num },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
    render: row => h(BackRowActions, {
      onView: () => { viewOnly.value = true; openModal(row, findIndex(row)) },
      onEdit: () => { viewOnly.value = false; openModal(row, findIndex(row)) },
      onDelete: () => { removeData(findIndex(row)); message.success('已删除') },
    }),
  },
]
</script>

<template>
  <div class="back-list-page">
    <BackListToolbar @add="onAdd" @batch-delete="onBatchDelete" @search="onSearch">
      <template #filters>
        <n-input v-model:value="filterSubject" placeholder="考试科目" clearable />
        <n-select v-model:value="filterType" placeholder="考试形式" clearable :options="examTypeOptions" />
      </template>
    </BackListToolbar>
    <n-data-table v-model:checked-row-keys="checkedRowKeys" :columns="columns" :data="tableData" :row-key="(r: ExamInfo) => r.id" bordered size="small" scroll-x="1200" striped :pagination="{ page, pageCount, onUpdatePage }" />
    <BackCrudModal v-model:show="openModalState" :title="modalTitle" card-class="!max-w-[560px]" @confirm="confirmSave" @cancel="closeModal">
      <n-form :model="changeModal" label-width="100px">
        <n-form-item label="考试名称"><n-input v-model:value="changeModal.exam_name" :disabled="viewOnly" /></n-form-item>
        <n-form-item label="考试科目"><n-input v-model:value="changeModal.exam_subject" :disabled="viewOnly" placeholder="科一" /></n-form-item>
        <n-form-item label="考试形式"><n-select v-model:value="changeModal.exam_type" :disabled="viewOnly" :options="examTypeOptions" /></n-form-item>
        <n-form-item label="地点"><n-input v-model:value="changeModal.exam_address" :disabled="viewOnly" /></n-form-item>
        <n-form-item label="日期"><n-input v-model:value="changeModal.exam_date" :disabled="viewOnly" placeholder="3月30日" /></n-form-item>
        <n-form-item label="可约人数"><n-input-number v-model:value="changeModal.max_num" class="w-full" :min="1" :disabled="viewOnly" /></n-form-item>
        <n-form-item label="已约人数"><n-input-number v-model:value="changeModal.booked_num" class="w-full" :min="0" :disabled="viewOnly" /></n-form-item>
        <n-form-item label="图片URL"><n-input v-model:value="changeModal.exam_photo" :disabled="viewOnly" /></n-form-item>
      </n-form>
      <template v-if="viewOnly" #footer><n-space justify="end" class="w-full"><n-button type="primary" @click="closeModal">关闭</n-button></n-space></template>
    </BackCrudModal>
  </div>
</template>

<style scoped>
.back-list-page :deep(.n-data-table-th) { font-weight: 600; background: #f5f7fa !important; }
</style>

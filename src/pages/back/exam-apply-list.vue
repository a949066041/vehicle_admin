<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { ExamApply } from '~/types/driving-school'
import { useMessage } from 'naive-ui'
import { h } from 'vue'
import BackApplyToolbar from '~/components/back/BackApplyToolbar.vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import { useExamApplyStore, useExamInfoStore, useStudentStore } from '~/store'
import { AUDIT_FILTER_OPTIONS, AUDIT_MODAL_OPTIONS, EXAM_PHOTO, renderAuditStatus } from '~/utils/back-audit'

const message = useMessage()
const { list, setApplyStatus, updateApply, removeApplies } = useExamApplyStore()
const { dataList: exams } = useExamInfoStore()
const { dataList: students } = useStudentStore()

const filterStatus = ref<string | null>(null)
const checkedRowKeys = ref<Array<string | number>>([])
const page = ref(1)
const showAudit = ref(false)
const showView = ref(false)
const showEdit = ref(false)
const auditIds = ref<number[]>([])
const auditStatus = ref<string | null>(null)
const auditRemark = ref('')
const viewing = ref<ExamApply | null>(null)
const editing = ref<ExamApply | null>(null)
const editRemark = ref('')

function examOf(id: number) {
  return exams.value.find(e => e.id === id)
}
function studentOf(id: number) {
  return students.value.find(s => s.id === id)
}

const filteredList = computed(() => list.value.filter(r => !filterStatus.value || r.status === filterStatus.value))
const tableData = computed(() => filteredList.value.slice((page.value - 1) * 10, page.value * 10))
const pageCount = computed(() => Math.max(1, Math.ceil(filteredList.value.length / 10)))
function rowIndex(i: number) { return (page.value - 1) * 10 + i + 1 }

function renderImg(examId: number) {
  const ex = examOf(examId)
  return h('img', { src: ex?.exam_photo || EXAM_PHOTO, class: 'h-12 w-12 rounded object-cover border border-slate-200', alt: '' })
}

function openAudit(ids: number[]) {
  if (!ids.length) { message.warning('请先勾选'); return }
  auditIds.value = ids
  auditStatus.value = '已通过'
  auditRemark.value = ''
  showAudit.value = true
}

function confirmAudit() {
  if (!auditStatus.value || !auditRemark.value.trim()) { message.warning('请完整填写'); return }
  auditIds.value.forEach(id => setApplyStatus(id, auditStatus.value!, auditRemark.value.trim()))
  showAudit.value = false
  checkedRowKeys.value = []
  message.success('审核已保存')
}

const columns: DataTableColumns<ExamApply> = [
  { type: 'selection' },
  { title: '序号', key: 'i', width: 64, render: (_r, i) => rowIndex(i) },
  { title: '科目', key: 'subject', width: 80, render: r => examOf(r.exam_id)?.exam_subject ?? '-' },
  { title: '考试形式', key: 'type', width: 110, render: r => examOf(r.exam_id)?.exam_type ?? '-' },
  { title: '地点', key: 'addr', width: 130, ellipsis: { tooltip: true }, render: r => examOf(r.exam_id)?.exam_address ?? '-' },
  { title: '日期', key: 'date', width: 88, render: r => examOf(r.exam_id)?.exam_date ?? '-' },
  { title: '图片', key: 'img', width: 80, render: r => renderImg(r.exam_id) },
  { title: '申请时间', key: 'addtime', width: 160, render: r => r.addtime ?? r.apply_date },
  { title: '学员账号', key: 'acc', width: 100, render: r => studentOf(r.student_id)?.username ?? '-' },
  { title: '学员姓名', key: 'name', width: 96, render: r => studentOf(r.student_id)?.name ?? '-' },
  { title: '审核意见', key: 'check_remark', width: 120, ellipsis: { tooltip: true }, render: r => r.check_remark || '-' },
  { title: '审核状态', key: 'status', width: 96, render: r => renderAuditStatus(r.status, 'exam') },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
    render: row => h(BackRowActions, {
      showEdit: row.status === '待审核',
      onView: () => { viewing.value = row; showView.value = true },
      onEdit: () => { editing.value = row; editRemark.value = row.check_remark; showEdit.value = true },
      onDelete: () => { removeApplies([row.id]); message.success('已删除') },
    }),
  },
]

function confirmEdit() {
  if (!editing.value) return
  updateApply(editing.value.id, { check_remark: editRemark.value })
  showEdit.value = false
  message.success('已保存')
}
</script>

<template>
  <div class="back-list-page">
    <BackApplyToolbar @batch-delete="() => { removeApplies(checkedRowKeys.map(Number)); checkedRowKeys = []; message.success('已删除') }" @audit="openAudit(checkedRowKeys.map(Number))" @search="page = 1">
      <template #filters>
        <n-select v-model:value="filterStatus" placeholder="审核状态" clearable :options="AUDIT_FILTER_OPTIONS" />
      </template>
    </BackApplyToolbar>
    <n-data-table v-model:checked-row-keys="checkedRowKeys" :columns="columns" :data="tableData" :row-key="(r: ExamApply) => r.id" bordered size="small" scroll-x="1400" striped :pagination="{ page, pageCount, onUpdatePage: (p: number) => (page = p) }" />
    <BackCrudModal v-model:show="showAudit" title="审核" card-class="!max-w-[480px]" @confirm="confirmAudit" @cancel="showAudit = false">
      <n-form label-width="96px">
        <n-form-item label="审核状态" required><n-select v-model:value="auditStatus" :options="AUDIT_MODAL_OPTIONS" /></n-form-item>
        <n-form-item label="内容" required><n-input v-model:value="auditRemark" type="textarea" :rows="4" /></n-form-item>
      </n-form>
    </BackCrudModal>
    <BackCrudModal v-model:show="showView" title="查看考试申请" @confirm="showView = false" @cancel="showView = false">
      <n-descriptions v-if="viewing" :column="1" bordered size="small" label-placement="left">
        <n-descriptions-item label="学员">{{ studentOf(viewing.student_id)?.name }}</n-descriptions-item>
        <n-descriptions-item label="考试">{{ examOf(viewing.exam_id)?.exam_name }}</n-descriptions-item>
        <n-descriptions-item label="审核意见">{{ viewing.check_remark || '-' }}</n-descriptions-item>
      </n-descriptions>
      <template #footer><n-space justify="end" class="w-full"><n-button type="primary" @click="showView = false">关闭</n-button></n-space></template>
    </BackCrudModal>
    <BackCrudModal v-model:show="showEdit" title="修改申请" @confirm="confirmEdit" @cancel="showEdit = false">
      <n-form label-width="96px"><n-form-item label="审核意见"><n-input v-model:value="editRemark" type="textarea" :rows="3" /></n-form-item></n-form>
    </BackCrudModal>
  </div>
</template>

<style scoped>
.back-list-page :deep(.n-data-table-th) { font-weight: 600; background: #f5f7fa !important; }
</style>

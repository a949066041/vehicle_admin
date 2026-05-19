<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { PracticeBooking } from '~/types/driving-school'
import { useMessage } from 'naive-ui'
import { h } from 'vue'
import BackApplyToolbar from '~/components/back/BackApplyToolbar.vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import {
  useCoachStore,
  usePracticeBookingStore,
  useSiteStore,
  useStudentStore,
  useTrainingProjectStore,
} from '~/store'
import {
  AUDIT_FILTER_OPTIONS,
  AUDIT_MODAL_OPTIONS,
  PRACTICE_PHOTO,
  renderAuditStatus,
} from '~/utils/back-audit'
import { coachWorkNo } from '~/utils/h5-booking'
import { bookingPhoto } from '~/utils/training-display'

const message = useMessage()
const { list, setStatus, updateBooking, removeBookings } = usePracticeBookingStore()
const { dataList: projects } = useTrainingProjectStore()
const { dataList: students } = useStudentStore()
const { dataList: coaches } = useCoachStore()
const { dataList: sites } = useSiteStore()

const filterStatus = ref<string | null>(null)
const filterStudent = ref('')
const checkedRowKeys = ref<Array<string | number>>([])
const page = ref(1)
const showAudit = ref(false)
const showView = ref(false)
const showEdit = ref(false)
const auditIds = ref<number[]>([])
const auditStatus = ref<string | null>(null)
const auditRemark = ref('')
const viewing = ref<PracticeBooking | null>(null)
const editing = ref<PracticeBooking | null>(null)
const editRemark = ref('')

function projectOf(id: number) {
  return projects.value.find(p => p.id === id)
}
function siteName(siteId: number) {
  return sites.value.find(s => s.id === siteId)?.site_name ?? '-'
}
function studentOf(id: number) {
  return students.value.find(s => s.id === id)
}
function coachOf(id: number) {
  return coaches.value.find(c => c.id === id)
}
function coachNo(id: number) {
  const c = coachOf(id)
  return c ? coachWorkNo(c.username, c.id) : '-'
}

const filteredList = computed(() => list.value.filter((row) => {
  if (filterStatus.value && row.status !== filterStatus.value)
    return false
  const st = studentOf(row.student_id)
  if (filterStudent.value && !(st?.name ?? '').includes(filterStudent.value.trim()) && !(st?.username ?? '').includes(filterStudent.value.trim()))
    return false
  return true
}))

const tableData = computed(() => {
  const start = (page.value - 1) * 10
  return filteredList.value.slice(start, start + 10)
})
const pageCount = computed(() => Math.max(1, Math.ceil(filteredList.value.length / 10)))
function rowIndex(i: number) { return (page.value - 1) * 10 + i + 1 }

function renderImg(row: PracticeBooking) {
  const src = bookingPhoto(projectOf(row.project_id))
  return h('img', { src, class: 'h-12 w-12 rounded object-cover border border-slate-200', alt: '' })
}

function openAudit(ids: number[]) {
  if (!ids.length) { message.warning('请先勾选记录'); return }
  auditIds.value = ids
  const first = list.value.find(r => r.id === ids[0])
  auditStatus.value = first?.status === '待审核' ? '已通过' : (first?.status ?? '已通过')
  auditRemark.value = first?.check_remark ?? ''
  showAudit.value = true
}

function confirmAudit() {
  if (!auditStatus.value) { message.warning('请选择审核状态'); return }
  if (!auditRemark.value.trim()) { message.warning('请填写审核内容'); return }
  for (const id of auditIds.value)
    setStatus(id, auditStatus.value!, auditRemark.value.trim())
  showAudit.value = false
  checkedRowKeys.value = []
  message.success('审核已保存')
}

function onBatchDelete() {
  if (!checkedRowKeys.value.length) { message.warning('请先勾选'); return }
  removeBookings(checkedRowKeys.value.map(Number))
  checkedRowKeys.value = []
  message.success('已删除')
}

const columns: DataTableColumns<PracticeBooking> = [
  { type: 'selection' },
  { title: '序号', key: 'i', width: 64, render: (_r, i) => rowIndex(i) },
  { title: '练车科目', key: 'subject', width: 88, render: r => projectOf(r.project_id)?.subject ?? '-' },
  { title: '练车车型', key: 'car_type', width: 88, render: r => projectOf(r.project_id)?.car_type ?? '-' },
  { title: '练车场地', key: 'site', width: 120, ellipsis: { tooltip: true }, render: r => siteName(projectOf(r.project_id)?.site_id ?? 0) },
  { title: '练车日期', key: 'date', width: 110, render: r => projectOf(r.project_id)?.train_date ?? r.appoint_date },
  { title: '练车时间', key: 'time', width: 110, render: r => projectOf(r.project_id)?.train_time ?? '-' },
  { title: '练车图片', key: 'img', width: 80, render: r => renderImg(r) },
  { title: '预约说明', key: 'remark', width: 120, ellipsis: { tooltip: true }, render: r => r.remark || '-' },
  { title: '教练工号', key: 'cno', width: 88, render: r => coachNo(r.coach_id) },
  { title: '教练姓名', key: 'cname', width: 96, render: r => coachOf(r.coach_id)?.name ?? '-' },
  { title: '学员账号', key: 'sacc', width: 100, render: r => studentOf(r.student_id)?.username ?? '-' },
  { title: '学员姓名', key: 'sname', width: 96, render: r => studentOf(r.student_id)?.name ?? '-' },
  { title: '审核回复', key: 'check_remark', width: 110, ellipsis: { tooltip: true }, render: r => r.check_remark || '-' },
  { title: '审核状态', key: 'status', width: 96, render: r => renderAuditStatus(r.status) },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
    render: row => h(BackRowActions, {
      showEdit: row.status === '待审核',
      onView: () => { viewing.value = row; showView.value = true },
      onEdit: () => { editing.value = row; editRemark.value = row.remark; showEdit.value = true },
      onDelete: () => { removeBookings([row.id]); message.success('已删除') },
    }),
  },
]

function confirmEdit() {
  if (!editing.value) return
  updateBooking(editing.value.id, { remark: editRemark.value })
  showEdit.value = false
  message.success('已保存')
}
</script>

<template>
  <div class="back-list-page">
    <BackApplyToolbar @batch-delete="onBatchDelete" @audit="openAudit(checkedRowKeys.map(Number))" @search="page = 1">
      <template #filters>
        <n-input v-model:value="filterStudent" placeholder="学员姓名/账号" clearable />
        <n-select v-model:value="filterStatus" placeholder="审核状态" clearable :options="AUDIT_FILTER_OPTIONS" />
      </template>
    </BackApplyToolbar>
    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="tableData"
      :row-key="(r: PracticeBooking) => r.id"
      bordered size="small" scroll-x="1600" striped
      :pagination="{ page, pageCount, onUpdatePage: (p: number) => (page = p) }"
    />
    <BackCrudModal v-model:show="showAudit" title="审核" card-class="!max-w-[480px]" @confirm="confirmAudit" @cancel="showAudit = false">
      <n-form label-width="96px">
        <n-form-item label="审核状态" required>
          <n-select v-model:value="auditStatus" :options="AUDIT_MODAL_OPTIONS" />
        </n-form-item>
        <n-form-item label="内容" required>
          <n-input v-model:value="auditRemark" type="textarea" :rows="4" placeholder="审核意见" />
        </n-form-item>
      </n-form>
    </BackCrudModal>
    <BackCrudModal v-model:show="showView" title="查看预约" @confirm="showView = false" @cancel="showView = false">
      <n-descriptions v-if="viewing" :column="1" bordered size="small" label-placement="left">
        <n-descriptions-item label="学员">{{ studentOf(viewing.student_id)?.name }}</n-descriptions-item>
        <n-descriptions-item label="预约说明">{{ viewing.remark }}</n-descriptions-item>
        <n-descriptions-item label="审核回复">{{ viewing.check_remark || '-' }}</n-descriptions-item>
        <n-descriptions-item label="状态">{{ viewing.status }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end" class="w-full"><n-button type="primary" @click="showView = false">关闭</n-button></n-space>
      </template>
    </BackCrudModal>
    <BackCrudModal v-model:show="showEdit" title="修改预约" @confirm="confirmEdit" @cancel="showEdit = false">
      <n-form label-width="96px">
        <n-form-item label="预约说明">
          <n-input v-model:value="editRemark" type="textarea" :rows="3" />
        </n-form-item>
      </n-form>
    </BackCrudModal>
  </div>
</template>

<style scoped>
.back-list-page :deep(.n-data-table-th) { font-weight: 600; background: #f5f7fa !important; }
</style>

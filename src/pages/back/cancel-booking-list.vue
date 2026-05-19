<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { CancelBookingRequest } from '~/types/driving-school'
import { useMessage } from 'naive-ui'
import { h } from 'vue'
import BackApplyToolbar from '~/components/back/BackApplyToolbar.vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import {
  useCancelBookingStore,
  useCoachStore,
  usePracticeBookingStore,
  useSiteStore,
  useStudentStore,
  useTrainingProjectStore,
} from '~/store'
import { AUDIT_FILTER_OPTIONS, AUDIT_MODAL_OPTIONS, renderAuditStatus } from '~/utils/back-audit'
import { coachWorkNo } from '~/utils/h5-booking'
import { bookingPhoto } from '~/utils/training-display'

const message = useMessage()
const { list, setStatus, removeCancels } = useCancelBookingStore()
const { list: bookings } = usePracticeBookingStore()
const { dataList: projects } = useTrainingProjectStore()
const { dataList: students } = useStudentStore()
const { dataList: coaches } = useCoachStore()
const { dataList: sites } = useSiteStore()

const filterStatus = ref<string | null>(null)
const checkedRowKeys = ref<Array<string | number>>([])
const page = ref(1)
const showAudit = ref(false)
const showView = ref(false)
const auditIds = ref<number[]>([])
const auditStatus = ref<string | null>(null)
const auditRemark = ref('')
const viewing = ref<CancelBookingRequest | null>(null)

function bookingOf(appointId: number) {
  return bookings.value.find(b => b.id === appointId)
}
function projectOf(bookingId: number) {
  const b = bookingOf(bookingId)
  return b ? projects.value.find(p => p.id === b.project_id) : undefined
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

const filteredList = computed(() => list.value.filter(r => !filterStatus.value || r.status === filterStatus.value))
const tableData = computed(() => filteredList.value.slice((page.value - 1) * 10, page.value * 10))
const pageCount = computed(() => Math.max(1, Math.ceil(filteredList.value.length / 10)))
function rowIndex(i: number) { return (page.value - 1) * 10 + i + 1 }

function renderImg(row: CancelBookingRequest) {
  const b = bookingOf(row.appoint_id)
  const src = bookingPhoto(b ? projectOf(row.appoint_id) : undefined)
  return h('img', { src, class: 'h-12 w-12 rounded object-cover border border-slate-200', alt: '' })
}

function openAudit(ids: number[]) {
  if (!ids.length) { message.warning('请先勾选'); return }
  auditIds.value = ids
  auditStatus.value = '已通过'
  auditRemark.value = '下次注意'
  showAudit.value = true
}

function confirmAudit() {
  if (!auditStatus.value || !auditRemark.value.trim()) { message.warning('请完整填写'); return }
  auditIds.value.forEach(id => setStatus(id, auditStatus.value!, auditRemark.value.trim()))
  showAudit.value = false
  checkedRowKeys.value = []
  message.success('审核已保存')
}

const columns: DataTableColumns<CancelBookingRequest> = [
  { type: 'selection' },
  { title: '序号', key: 'i', width: 64, render: (_r, i) => rowIndex(i) },
  { title: '练车科目', key: 'subject', width: 88, render: r => projectOf(r.appoint_id)?.subject ?? '-' },
  { title: '练车车型', key: 'car_type', width: 88, render: r => projectOf(r.appoint_id)?.car_type ?? '-' },
  { title: '练车场地', key: 'site', width: 130, ellipsis: { tooltip: true }, render: r => siteName(projectOf(r.appoint_id)?.site_id ?? 0) },
  { title: '练车日期', key: 'date', width: 110, render: r => projectOf(r.appoint_id)?.train_date ?? '-' },
  { title: '练车时间', key: 'time', width: 110, render: r => projectOf(r.appoint_id)?.train_time ?? '-' },
  { title: '练车图片', key: 'img', width: 80, render: r => renderImg(r) },
  { title: '取消原因', key: 'cancel_reason', width: 110, ellipsis: { tooltip: true } },
  { title: '教练工号', key: 'cno', width: 88, render: r => coachNo(bookingOf(r.appoint_id)?.coach_id ?? 0) },
  { title: '教练姓名', key: 'cname', width: 96, render: r => coachOf(bookingOf(r.appoint_id)?.coach_id ?? 0)?.name ?? '-' },
  { title: '学员账号', key: 'sacc', width: 100, render: r => studentOf(r.student_id)?.username ?? '-' },
  { title: '学员姓名', key: 'sname', width: 96, render: r => studentOf(r.student_id)?.name ?? '-' },
  { title: '审核回复', key: 'check_remark', width: 110, ellipsis: { tooltip: true }, render: r => r.check_remark || '-' },
  { title: '审核状态', key: 'status', width: 96, render: r => renderAuditStatus(r.status) },
  {
    title: '操作',
    key: 'action',
    width: 160,
    fixed: 'right',
    render: row => h(BackRowActions, {
      showEdit: false,
      onView: () => { viewing.value = row; showView.value = true },
      onDelete: () => { removeCancels([row.id]); message.success('已删除') },
    }),
  },
]
</script>

<template>
  <div class="back-list-page">
    <BackApplyToolbar @batch-delete="() => { removeCancels(checkedRowKeys.map(Number)); checkedRowKeys = []; message.success('已删除') }" @audit="openAudit(checkedRowKeys.map(Number))" @search="page = 1">
      <template #filters>
        <n-select v-model:value="filterStatus" placeholder="审核状态" clearable :options="AUDIT_FILTER_OPTIONS" />
      </template>
    </BackApplyToolbar>
    <n-data-table v-model:checked-row-keys="checkedRowKeys" :columns="columns" :data="tableData" :row-key="(r: CancelBookingRequest) => r.id" bordered size="small" scroll-x="1500" striped :pagination="{ page, pageCount, onUpdatePage: (p: number) => (page = p) }" />
    <BackCrudModal v-model:show="showAudit" title="审核" card-class="!max-w-[480px]" @confirm="confirmAudit" @cancel="showAudit = false">
      <n-form label-width="96px">
        <n-form-item label="审核状态" required><n-select v-model:value="auditStatus" :options="AUDIT_MODAL_OPTIONS" /></n-form-item>
        <n-form-item label="内容" required><n-input v-model:value="auditRemark" type="textarea" :rows="4" /></n-form-item>
      </n-form>
    </BackCrudModal>
    <BackCrudModal v-model:show="showView" title="查看取消申请" @confirm="showView = false" @cancel="showView = false">
      <n-descriptions v-if="viewing" :column="1" bordered size="small" label-placement="left">
        <n-descriptions-item label="取消原因">{{ viewing.cancel_reason }}</n-descriptions-item>
        <n-descriptions-item label="审核回复">{{ viewing.check_remark || '-' }}</n-descriptions-item>
        <n-descriptions-item label="状态">{{ viewing.status }}</n-descriptions-item>
      </n-descriptions>
      <template #footer><n-space justify="end" class="w-full"><n-button type="primary" @click="showView = false">关闭</n-button></n-space></template>
    </BackCrudModal>
  </div>
</template>

<style scoped>
.back-list-page :deep(.n-data-table-th) { font-weight: 600; background: #f5f7fa !important; }
</style>

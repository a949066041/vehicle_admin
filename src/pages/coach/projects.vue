<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { DrivingReview, PracticeBooking, TrainingProject } from '~/types/driving-school'
import { NTag, useMessage } from 'naive-ui'
import { h } from 'vue'
import BackApplyToolbar from '~/components/back/BackApplyToolbar.vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import CoachRowActions from '~/components/back/CoachRowActions.vue'
import {
  useDrivingReviewStore,
  useLoginStore,
  usePracticeBookingStore,
  useSiteStore,
  useStudentStore,
  useTrainingProjectStore,
  useVehicleStore,
} from '~/store'
import {
  AUDIT_FILTER_OPTIONS,
  AUDIT_MODAL_OPTIONS,
  PRACTICE_PHOTO,
  renderAuditStatus,
} from '~/utils/back-audit'
import { coachWorkNo } from '~/utils/h5-booking'
import { bookingPhoto } from '~/utils/training-display'
import { nextNumericId } from '~/utils/driving-school'

const message = useMessage()
const { currentProfile } = useLoginStore()
const { dataList: sites } = useSiteStore()
const { dataList: vehicles } = useVehicleStore()
const { dataList: students } = useStudentStore()
const projectStore = useTrainingProjectStore()
const { dataList, removeData, openModalState, openModal, closeModal, changeModal, saveForm, isUpdate } = projectStore
const { list: bookings, setStatus, removeBookings } = usePracticeBookingStore()
const { list: reviews, upsertStudentReview, updateCoachFeedback } = useDrivingReviewStore()

const cid = computed(() => currentProfile.value?.id ?? 0)
const coachName = computed(() => currentProfile.value?.name ?? '')
const coachNo = computed(() => coachWorkNo(currentProfile.value?.username ?? '', cid.value))

const activeTab = ref('projects')

const filterSubject = ref('')
const filterBookStatus = ref<string | null>(null)
const projPage = ref(1)
const checkedProjKeys = ref<Array<string | number>>([])
const viewOnly = ref(false)

const filterBookingStatus = ref<string | null>(null)
const filterStudent = ref('')
const bookPage = ref(1)
const checkedBookKeys = ref<Array<string | number>>([])

const showAudit = ref(false)
const auditIds = ref<number[]>([])
const auditStatus = ref<string | null>(null)
const auditRemark = ref('')

const showViewBook = ref(false)
const viewingBook = ref<PracticeBooking | null>(null)

const showComments = ref(false)
const commentRows = ref<DrivingReview[]>([])

const showEvaluate = ref(false)
const evalReviewId = ref(0)
const evalProgress = ref(5)
const evalAttitude = ref(5)
const evalComment = ref('')

const bookStatusOptions = [
  { label: '可预约', value: '可预约' },
  { label: '已预约', value: '已预约' },
]

const myProjects = computed(() => dataList.value.filter(p => p.coach_id === cid.value))
const myBookings = computed(() => bookings.value.filter(b => b.coach_id === cid.value))

const filteredProjects = computed(() => {
  return myProjects.value.filter((row) => {
    if (filterSubject.value && !row.subject.includes(filterSubject.value.trim()))
      return false
    if (filterBookStatus.value && row.book_status !== filterBookStatus.value)
      return false
    return true
  })
})

const projTableData = computed(() => {
  const start = (projPage.value - 1) * 10
  return filteredProjects.value.slice(start, start + 10)
})
const projPageCount = computed(() => Math.max(1, Math.ceil(filteredProjects.value.length / 10)))

const filteredBookings = computed(() => {
  return myBookings.value.filter((row) => {
    if (filterBookingStatus.value && row.status !== filterBookingStatus.value)
      return false
    const st = students.value.find(s => s.id === row.student_id)
    const q = filterStudent.value.trim()
    if (q && !(st?.name ?? '').includes(q) && !(st?.username ?? '').includes(q))
      return false
    return true
  })
})

const bookTableData = computed(() => {
  const start = (bookPage.value - 1) * 10
  return filteredBookings.value.slice(start, start + 10)
})
const bookPageCount = computed(() => Math.max(1, Math.ceil(filteredBookings.value.length / 10)))

function projRowIndex(i: number) { return (projPage.value - 1) * 10 + i + 1 }
function bookRowIndex(i: number) { return (bookPage.value - 1) * 10 + i + 1 }

function siteName(id: number) {
  return sites.value.find(s => s.id === id)?.site_name ?? '-'
}

function carPlate(carId?: number) {
  if (!carId)
    return '-'
  return vehicles.value.find(v => v.id === carId)?.car_num ?? '-'
}

function projectOf(id: number) {
  return dataList.value.find(p => p.id === id)
}

function studentOf(id: number) {
  return students.value.find(s => s.id === id)
}

function findProjectIndex(row: TrainingProject) {
  return dataList.value.findIndex(r => r.id === row.id)
}

function renderPhoto(row: TrainingProject) {
  const src = row.practice_photo || PRACTICE_PHOTO
  return h('img', { src, class: 'h-12 w-12 rounded object-cover border border-slate-200', alt: '练车' })
}

function renderBookStatus(status?: string) {
  const s = status ?? '可预约'
  return h(NTag, { size: 'small', bordered: false, type: s === '已预约' ? 'warning' : 'success' }, { default: () => s })
}

function renderBookImg(row: PracticeBooking) {
  const src = bookingPhoto(projectOf(row.project_id))
  return h('img', { src, class: 'h-12 w-12 rounded object-cover border border-slate-200', alt: '' })
}

function canEvaluate(row: PracticeBooking) {
  return row.status === '已通过'
}

function reviewForBooking(row: PracticeBooking) {
  return reviews.value.find(r => r.student_id === row.student_id && r.coach_id === row.coach_id)
}

function onViewProject(row: TrainingProject) {
  viewOnly.value = true
  openModal(row, findProjectIndex(row))
}

function onEditProject(row: TrainingProject) {
  viewOnly.value = false
  openModal(row, findProjectIndex(row))
}

function onDeleteProject(row: TrainingProject) {
  removeData(findProjectIndex(row))
  message.success('练车项目已删除')
}

function onAddProject() {
  if (!cid.value) {
    message.error('未登录')
    return
  }
  viewOnly.value = false
  openModal({
    subject: '科二',
    car_type: 'C1',
    site_id: sites.value[0]?.id ?? 1,
    coach_id: cid.value,
    car_id: vehicles.value[0]?.id ?? 1,
    train_date: '2025-03-20',
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

function onBatchDeleteProjects() {
  if (!checkedProjKeys.value.length) {
    message.warning('请先勾选要删除的项目')
    return
  }
  const ids = new Set(checkedProjKeys.value)
  dataList.value = dataList.value.filter(r => !ids.has(r.id))
  checkedProjKeys.value = []
  message.success('已删除选中项目')
}

function confirmSaveProject() {
  if (viewOnly.value) {
    closeModal()
    return
  }
  if (!isUpdate.value) {
    changeModal.value.id = nextNumericId(dataList.value)
    changeModal.value.coach_id = cid.value
    changeModal.value.booked_num = changeModal.value.booked_num ?? 0
    changeModal.value.status = changeModal.value.status ?? '可预约'
    changeModal.value.book_status = changeModal.value.book_status ?? '可预约'
    changeModal.value.comment_num = changeModal.value.comment_num ?? 0
    changeModal.value.favorite_num = changeModal.value.favorite_num ?? 0
  }
  changeModal.value.practice_photo = (changeModal.value.practice_photo ?? '').trim() || PRACTICE_PHOTO
  if (!changeModal.value.project_name?.trim()) {
    const site = siteName(changeModal.value.site_id)
    changeModal.value.project_name = `${changeModal.value.subject}-${site}`
  }
  saveForm()
  message.success(isUpdate.value ? '已保存' : '练车项目已发布')
}

function openProjectComments(row: TrainingProject) {
  commentRows.value = reviews.value.filter(r => r.coach_id === row.coach_id && r.subject === row.subject)
  showComments.value = true
}

function openAudit(ids: number[]) {
  if (!ids.length) {
    message.warning('请先勾选预约记录')
    return
  }
  auditIds.value = ids
  const first = bookings.value.find(r => r.id === ids[0])
  auditStatus.value = first?.status === '待审核' ? '已通过' : (first?.status ?? '已通过')
  auditRemark.value = first?.check_remark ?? ''
  showAudit.value = true
}

function confirmAudit() {
  if (!auditStatus.value) {
    message.warning('请选择审核状态')
    return
  }
  if (!auditRemark.value.trim()) {
    message.warning('请填写审核回复')
    return
  }
  for (const id of auditIds.value)
    setStatus(id, auditStatus.value!, auditRemark.value.trim())
  showAudit.value = false
  checkedBookKeys.value = []
  message.success('审核已保存')
}

function onBatchDeleteBookings() {
  if (!checkedBookKeys.value.length) {
    message.warning('请先勾选')
    return
  }
  removeBookings(checkedBookKeys.value.map(Number))
  checkedBookKeys.value = []
  message.success('已删除')
}

function openEvaluate(row: PracticeBooking) {
  const proj = projectOf(row.project_id)
  let rev = reviewForBooking(row)
  if (!rev) {
    upsertStudentReview({
      student_id: row.student_id,
      coach_id: row.coach_id,
      student_star: 5,
      student_comment: row.remark || '学员练车预约',
      subject: proj?.subject,
      car_type: proj?.car_type,
      practice_photo: proj?.practice_photo,
    })
    rev = reviewForBooking(row)
  }
  if (!rev) {
    message.error('无法创建评价记录')
    return
  }
  evalReviewId.value = rev.id
  evalProgress.value = rev.coach_progress_star || rev.coach_star || 5
  evalAttitude.value = rev.coach_attitude_star || rev.coach_star || 5
  evalComment.value = rev.coach_comment || ''
  showEvaluate.value = true
}

function confirmEvaluate() {
  if (!evalComment.value.trim()) {
    message.warning('请填写教练评价内容')
    return
  }
  updateCoachFeedback(evalReviewId.value, {
    coach_star: evalProgress.value,
    coach_progress_star: evalProgress.value,
    coach_attitude_star: evalAttitude.value,
    coach_comment: evalComment.value.trim(),
  })
  showEvaluate.value = false
  message.success('教练评价已保存')
}

const projectColumns: DataTableColumns<TrainingProject> = [
  { type: 'selection' },
  { title: '序号', key: 'i', width: 64, render: (_r, i) => projRowIndex(i) },
  { title: '练车科目', key: 'subject', width: 88 },
  { title: '练车车型', key: 'car_type', width: 88 },
  { title: '练车场地', key: 'site', width: 130, ellipsis: { tooltip: true }, render: r => siteName(r.site_id) },
  { title: '练车日期', key: 'train_date', width: 110 },
  { title: '练车时间', key: 'train_time', width: 110 },
  { title: '预约状态', key: 'book_status', width: 96, render: r => renderBookStatus(r.book_status) },
  { title: '练车图片', key: 'img', width: 80, render: r => renderPhoto(r) },
  { title: '教练工号', key: 'cno', width: 88, render: () => coachNo.value },
  { title: '教练姓名', key: 'cname', width: 96, render: () => coachName.value },
  { title: '车牌号', key: 'car', width: 110, render: r => carPlate(r.car_id) },
  { title: '评论数', key: 'comment_num', width: 80, render: r => r.comment_num ?? 0 },
  { title: '收藏数', key: 'favorite_num', width: 80, render: r => r.favorite_num ?? 0 },
  {
    title: '操作',
    key: 'action',
    width: 280,
    fixed: 'right',
    render: row => h(CoachRowActions, {
      showEdit: true,
      showComments: true,
      onView: () => onViewProject(row),
      onEdit: () => onEditProject(row),
      onComments: () => openProjectComments(row),
      onDelete: () => onDeleteProject(row),
    }),
  },
]

const bookingColumns: DataTableColumns<PracticeBooking> = [
  { type: 'selection' },
  { title: '序号', key: 'i', width: 64, render: (_r, i) => bookRowIndex(i) },
  { title: '练车科目', key: 'subject', width: 88, render: r => projectOf(r.project_id)?.subject ?? '-' },
  { title: '练车车型', key: 'car_type', width: 88, render: r => projectOf(r.project_id)?.car_type ?? '-' },
  { title: '练车场地', key: 'site', width: 120, ellipsis: { tooltip: true }, render: r => siteName(projectOf(r.project_id)?.site_id ?? 0) },
  { title: '练车日期', key: 'date', width: 110, render: r => projectOf(r.project_id)?.train_date ?? r.appoint_date },
  { title: '练车时间', key: 'time', width: 110, render: r => projectOf(r.project_id)?.train_time ?? '-' },
  { title: '练车图片', key: 'img', width: 80, render: r => renderBookImg(r) },
  { title: '预约说明', key: 'remark', width: 120, ellipsis: { tooltip: true }, render: r => r.remark || '-' },
  { title: '教练工号', key: 'cno', width: 88, render: () => coachNo.value },
  { title: '教练姓名', key: 'cname', width: 96, render: () => coachName.value },
  { title: '学员账号', key: 'sacc', width: 100, render: r => studentOf(r.student_id)?.username ?? '-' },
  { title: '学员姓名', key: 'sname', width: 96, render: r => studentOf(r.student_id)?.name ?? '-' },
  { title: '审核回复', key: 'check_remark', width: 110, ellipsis: { tooltip: true }, render: r => r.check_remark || '-' },
  { title: '审核状态', key: 'status', width: 96, render: r => renderAuditStatus(r.status) },
  {
    title: '操作',
    key: 'action',
    width: 260,
    fixed: 'right',
    render: row => h(CoachRowActions, {
      showEvaluate: canEvaluate(row),
      onView: () => { viewingBook.value = row; showViewBook.value = true },
      onEvaluate: () => openEvaluate(row),
      onDelete: () => { removeBookings([row.id]); message.success('已删除') },
    }),
  },
]

const modalProjectTitle = computed(() => {
  if (viewOnly.value)
    return '查看练车项目'
  return isUpdate.value ? '修改练车项目' : '发布练车项目'
})
</script>

<template>
  <div class="back-list-page">
    <h3 class="mb-4 text-lg font-semibold text-slate-800">
      教练练车项目管理
    </h3>
    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="projects" tab="练车项目发布">
        <BackListToolbar @add="onAddProject" @batch-delete="onBatchDeleteProjects" @search="projPage = 1">
          <template #filters>
            <n-input v-model:value="filterSubject" placeholder="练车科目" clearable />
            <n-select v-model:value="filterBookStatus" placeholder="预约状态" clearable :options="bookStatusOptions" />
          </template>
        </BackListToolbar>
        <n-data-table
          v-model:checked-row-keys="checkedProjKeys"
          :columns="projectColumns"
          :data="projTableData"
          :row-key="(r: TrainingProject) => r.id"
          bordered
          size="small"
          scroll-x="1500"
          striped
          :pagination="{ page: projPage, pageCount: projPageCount, onUpdatePage: (p: number) => (projPage = p) }"
        />
      </n-tab-pane>

      <n-tab-pane name="bookings" tab="学员预约审核">
        <BackApplyToolbar
          @batch-delete="onBatchDeleteBookings"
          @audit="openAudit(checkedBookKeys.map(Number))"
          @search="bookPage = 1"
        >
          <template #filters>
            <n-input v-model:value="filterStudent" placeholder="学员姓名/账号" clearable />
            <n-select v-model:value="filterBookingStatus" placeholder="审核状态" clearable :options="AUDIT_FILTER_OPTIONS" />
          </template>
        </BackApplyToolbar>
        <n-data-table
          v-model:checked-row-keys="checkedBookKeys"
          :columns="bookingColumns"
          :data="bookTableData"
          :row-key="(r: PracticeBooking) => r.id"
          bordered
          size="small"
          scroll-x="1600"
          striped
          :pagination="{ page: bookPage, pageCount: bookPageCount, onUpdatePage: (p: number) => (bookPage = p) }"
        />
      </n-tab-pane>
    </n-tabs>

    <BackCrudModal
      v-model:show="openModalState"
      :title="modalProjectTitle"
      card-class="!max-w-[600px]"
      @confirm="confirmSaveProject"
      @cancel="closeModal"
    >
      <n-form :model="changeModal" label-width="100px">
        <n-form-item label="项目名称">
          <n-input v-model:value="changeModal.project_name" :disabled="viewOnly" placeholder="可留空自动生成" />
        </n-form-item>
        <n-form-item label="练车科目">
          <n-input v-model:value="changeModal.subject" :disabled="viewOnly" placeholder="如 科二" />
        </n-form-item>
        <n-form-item label="练车车型">
          <n-select v-model:value="changeModal.car_type" :disabled="viewOnly" :options="[{ label: 'C1', value: 'C1' }, { label: 'C2', value: 'C2' }]" />
        </n-form-item>
        <n-form-item label="练车场地">
          <n-select v-model:value="changeModal.site_id" :disabled="viewOnly" :options="sites.map(s => ({ label: s.site_name, value: s.id }))" />
        </n-form-item>
        <n-form-item label="关联车辆">
          <n-select v-model:value="changeModal.car_id" :disabled="viewOnly" :options="vehicles.map(v => ({ label: v.car_num, value: v.id }))" />
        </n-form-item>
        <n-form-item label="练车日期">
          <n-input v-model:value="changeModal.train_date" :disabled="viewOnly" placeholder="YYYY-MM-DD" />
        </n-form-item>
        <n-form-item label="练车时间">
          <n-input v-model:value="changeModal.train_time" :disabled="viewOnly" placeholder="8:00-9:00" />
        </n-form-item>
        <n-form-item label="预约状态">
          <n-select v-model:value="changeModal.book_status" :disabled="viewOnly" :options="bookStatusOptions" />
        </n-form-item>
        <n-form-item label="可约人数">
          <n-input-number v-model:value="changeModal.max_num" class="w-full" :min="1" :disabled="viewOnly" />
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

    <BackCrudModal v-model:show="showAudit" title="审核学员预约" card-class="!max-w-[480px]" @confirm="confirmAudit" @cancel="showAudit = false">
      <n-form label-width="96px">
        <n-form-item label="审核状态" required>
          <n-select v-model:value="auditStatus" :options="AUDIT_MODAL_OPTIONS" />
        </n-form-item>
        <n-form-item label="审核回复" required>
          <n-input v-model:value="auditRemark" type="textarea" :rows="4" placeholder="如：认真学习！" />
        </n-form-item>
      </n-form>
    </BackCrudModal>

    <BackCrudModal v-model:show="showViewBook" title="查看预约" @confirm="showViewBook = false" @cancel="showViewBook = false">
      <n-descriptions v-if="viewingBook" :column="1" bordered size="small" label-placement="left">
        <n-descriptions-item label="学员">
          {{ studentOf(viewingBook.student_id)?.name }}（{{ studentOf(viewingBook.student_id)?.username }}）
        </n-descriptions-item>
        <n-descriptions-item label="预约说明">
          {{ viewingBook.remark || '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="审核回复">
          {{ viewingBook.check_remark || '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="审核状态">
          {{ viewingBook.status }}
        </n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end" class="w-full">
          <n-button type="primary" @click="showViewBook = false">
            关闭
          </n-button>
        </n-space>
      </template>
    </BackCrudModal>

    <BackCrudModal v-model:show="showComments" title="练车评论" card-class="!max-w-[560px]" @confirm="showComments = false" @cancel="showComments = false">
      <n-list v-if="commentRows.length" bordered>
        <n-list-item v-for="r in commentRows" :key="r.id">
          <div class="text-sm">
            <div class="font-medium text-slate-800">
              学员：{{ studentOf(r.student_id)?.name ?? '-' }}
            </div>
            <div class="mt-1 text-slate-600">
              {{ r.student_comment || '（无文字评价）' }}
            </div>
          </div>
        </n-list-item>
      </n-list>
      <n-empty v-else description="暂无评论" />
      <template #footer>
        <n-space justify="end" class="w-full">
          <n-button type="primary" @click="showComments = false">
            关闭
          </n-button>
        </n-space>
      </template>
    </BackCrudModal>

    <BackCrudModal v-model:show="showEvaluate" title="教练评价" card-class="!max-w-[480px]" @confirm="confirmEvaluate" @cancel="showEvaluate = false">
      <n-form label-width="96px">
        <n-form-item label="学习成果">
          <n-rate v-model:value="evalProgress" />
        </n-form-item>
        <n-form-item label="学习态度">
          <n-rate v-model:value="evalAttitude" />
        </n-form-item>
        <n-form-item label="评价内容" required>
          <n-input v-model:value="evalComment" type="textarea" :rows="4" placeholder="如：认真学习！倒库还需加强" />
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
</style>

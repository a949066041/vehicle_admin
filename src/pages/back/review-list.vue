<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { DrivingReview } from '~/types/driving-school'
import { NRate, useMessage } from 'naive-ui'
import { h } from 'vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import { useCoachStore, useDrivingReviewStore, useStudentStore } from '~/store'
import { PRACTICE_PHOTO } from '~/utils/back-audit'
import { coachWorkNo } from '~/utils/h5-booking'

const message = useMessage()
const { list, updateCoachFeedback, removeReviews } = useDrivingReviewStore()
const { dataList: students } = useStudentStore()
const { dataList: coaches } = useCoachStore()

const checkedCoach = ref<Array<string | number>>([])
const checkedStudent = ref<Array<string | number>>([])
const pageCoach = ref(1)
const pageStudent = ref(1)
const showView = ref(false)
const viewing = ref<DrivingReview | null>(null)

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

const coachReviews = computed(() => list.value.filter(r => (r.coach_star ?? 0) > 0 || r.coach_comment))
const studentReviews = computed(() => list.value.filter(r => (r.student_star ?? 0) > 0 || r.student_comment))

const coachTable = computed(() => coachReviews.value.slice((pageCoach.value - 1) * 10, pageCoach.value * 10))
const studentTable = computed(() => studentReviews.value.slice((pageStudent.value - 1) * 10, pageStudent.value * 10))
const pageCountCoach = computed(() => Math.max(1, Math.ceil(coachReviews.value.length / 10)))
const pageCountStudent = computed(() => Math.max(1, Math.ceil(studentReviews.value.length / 10)))

function rowIndex(page: number, i: number) {
  return (page - 1) * 10 + i + 1
}

function renderPhoto(row: DrivingReview) {
  return h('img', { src: row.practice_photo || PRACTICE_PHOTO, class: 'h-12 w-12 rounded object-cover border border-slate-200', alt: '' })
}

function renderStars(n: number) {
  return h(NRate, { readonly: true, size: 'small', value: n })
}

function baseCols(page: number): DataTableColumns<DrivingReview> {
  return [
    { type: 'selection' },
    { title: '序号', key: 'i', width: 64, render: (_r, i) => rowIndex(page, i) },
    { title: '练车科目', key: 'subject', width: 88, render: r => r.subject ?? '科二' },
    { title: '练车车型', key: 'car_type', width: 88, render: r => r.car_type ?? 'C1' },
    { title: '练车图片', key: 'photo', width: 80, render: r => renderPhoto(r) },
  ]
}

const coachColumns: DataTableColumns<DrivingReview> = [
  ...baseCols(pageCoach.value),
  { title: '学习成果', key: 'p', width: 120, render: r => renderStars(r.coach_progress_star ?? r.coach_star) },
  { title: '学习态度', key: 'a', width: 120, render: r => renderStars(r.coach_attitude_star ?? r.coach_star) },
  { title: '评价时间', key: 'addtime', width: 160 },
  { title: '学员账号', key: 'sacc', width: 100, render: r => studentOf(r.student_id)?.username ?? '-' },
  { title: '学员姓名', key: 'sname', width: 96, render: r => studentOf(r.student_id)?.name ?? '-' },
  { title: '教练工号', key: 'cno', width: 88, render: r => coachNo(r.coach_id) },
  { title: '教练姓名', key: 'cname', width: 96, render: r => coachOf(r.coach_id)?.name ?? '-' },
  { title: '审核回复', key: 'reply', width: 110, ellipsis: { tooltip: true }, render: r => r.student_reply || '-' },
  {
    title: '操作',
    key: 'action',
    width: 160,
    fixed: 'right',
    render: row => h(BackRowActions, {
      showEdit: false,
      onView: () => { viewing.value = row; showView.value = true },
      onDelete: () => { removeReviews([row.id]); message.success('已删除') },
    }),
  },
]

const studentColumns: DataTableColumns<DrivingReview> = [
  ...baseCols(pageStudent.value),
  { title: '服务质量', key: 'sv', width: 120, render: r => renderStars(r.student_service_star ?? r.student_star) },
  { title: '服务态度', key: 'at', width: 120, render: r => renderStars(r.student_attitude_star ?? r.student_star) },
  { title: '评价时间', key: 'addtime', width: 160 },
  { title: '教练工号', key: 'cno', width: 88, render: r => coachNo(r.coach_id) },
  { title: '教练姓名', key: 'cname', width: 96, render: r => coachOf(r.coach_id)?.name ?? '-' },
  { title: '审核回复', key: 'reply', width: 110, ellipsis: { tooltip: true }, render: r => r.coach_reply || '-' },
  {
    title: '操作',
    key: 'action',
    width: 160,
    fixed: 'right',
    render: row => h(BackRowActions, {
      showEdit: false,
      onView: () => { viewing.value = row; showView.value = true },
      onDelete: () => { removeReviews([row.id]); message.success('已删除') },
    }),
  },
]
</script>

<template>
  <div class="back-list-page space-y-8">
    <section>
      <h3 class="mb-3 text-base font-semibold text-slate-800">
        教练评学员
      </h3>
      <BackListToolbar
        hide-add
        @batch-delete="() => { removeReviews(checkedCoach.map(Number)); checkedCoach = []; message.success('已删除') }"
        @search="pageCoach = 1"
      >
        <template #filters><span class="text-sm text-slate-500">双向评价记录</span></template>
      </BackListToolbar>
      <n-data-table
        v-model:checked-row-keys="checkedCoach"
        :columns="coachColumns"
        :data="coachTable"
        :row-key="(r: DrivingReview) => `c-${r.id}`"
        bordered size="small" scroll-x="1400" striped
        :pagination="{ page: pageCoach, pageCount: pageCountCoach, onUpdatePage: (p: number) => (pageCoach = p) }"
      />
    </section>

    <section>
      <h3 class="mb-3 text-base font-semibold text-slate-800">
        学员评教练
      </h3>
      <BackListToolbar
        hide-add
        @batch-delete="() => { removeReviews(checkedStudent.map(Number)); checkedStudent = []; message.success('已删除') }"
        @search="pageStudent = 1"
      >
        <template #filters><span /></template>
      </BackListToolbar>
      <n-data-table
        v-model:checked-row-keys="checkedStudent"
        :columns="studentColumns"
        :data="studentTable"
        :row-key="(r: DrivingReview) => `s-${r.id}`"
        bordered size="small" scroll-x="1200" striped
        :pagination="{ page: pageStudent, pageCount: pageCountStudent, onUpdatePage: (p: number) => (pageStudent = p) }"
      />
    </section>

    <BackCrudModal v-model:show="showView" title="查看评价" @confirm="showView = false" @cancel="showView = false">
      <n-descriptions v-if="viewing" :column="1" bordered size="small" label-placement="left">
        <n-descriptions-item label="学员">{{ studentOf(viewing.student_id)?.name }}</n-descriptions-item>
        <n-descriptions-item label="教练">{{ coachOf(viewing.coach_id)?.name }}</n-descriptions-item>
        <n-descriptions-item label="学员评价">{{ viewing.student_comment || '-' }}</n-descriptions-item>
        <n-descriptions-item label="教练评价">{{ viewing.coach_comment || '-' }}</n-descriptions-item>
        <n-descriptions-item label="学员回复">{{ viewing.student_reply || '-' }}</n-descriptions-item>
        <n-descriptions-item label="教练回复">{{ viewing.coach_reply || '-' }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end" class="w-full"><n-button type="primary" @click="showView = false">关闭</n-button></n-space>
      </template>
    </BackCrudModal>
  </div>
</template>

<style scoped>
.back-list-page :deep(.n-data-table-th) { font-weight: 600; background: #f5f7fa !important; }
</style>

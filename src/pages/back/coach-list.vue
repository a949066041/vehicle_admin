<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { Coach } from '~/types/driving-school'
import { useMessage } from 'naive-ui'
import { h } from 'vue'
import { useRouter } from 'vue-router'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import { useCoachStore } from '~/store'
import { coachWorkNo } from '~/utils/h5-booking'
import { nextNumericId } from '~/utils/driving-school'

const message = useMessage()
const router = useRouter()
const store = useCoachStore()
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
  updateDataIndex,
  isUpdate,
} = store

const filterJobNo = ref('')
const filterName = ref('')
const checkedRowKeys = ref<Array<string | number>>([])
const viewOnly = ref(false)

const genderOptions = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
]

const filteredList = computed(() => {
  return dataList.value.filter((row) => {
    const job = coachWorkNo(row.username, row.id)
    if (filterJobNo.value && !job.includes(filterJobNo.value.trim()))
      return false
    if (filterName.value && !row.name.includes(filterName.value.trim()))
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
    return '查看教练'
  return isUpdate.value ? '修改教练' : '新增教练'
})

function rowIndex(index: number) {
  return (page.value - 1) * 10 + index + 1
}

function renderAvatar(row: Coach) {
  if (row.avatar) {
    return h('img', {
      src: row.avatar,
      class: 'h-12 w-12 rounded object-cover border border-slate-200',
      alt: row.name,
    })
  }
  return h(
    'div',
    { class: 'flex h-12 w-12 items-center justify-center rounded bg-teal-50 text-sm font-medium text-teal-800' },
    row.name.slice(0, 1),
  )
}

function findIndex(row: Coach) {
  return dataList.value.findIndex(r => r.id === row.id)
}

function onView(row: Coach) {
  viewOnly.value = true
  openModal(row, findIndex(row))
}

function onEdit(row: Coach) {
  viewOnly.value = false
  openModal(row, findIndex(row))
}

function onComments() {
  router.push('/back/review-list')
}

function onDelete(row: Coach) {
  removeData(findIndex(row))
  message.success('已删除')
}

function onAdd() {
  viewOnly.value = false
  openModal({
    gender: '男',
    age: 35,
    teach_age: 5,
    intro: '',
    avatar: '',
    password: '123456',
    click_num: 0,
    comment_num: 0,
    favorite_num: 0,
    enabled: 1,
  } as Coach)
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
  if (!changeModal.value.username?.trim()) {
    message.warning('请填写教练工号/账号')
    return
  }
  if (!changeModal.value.name?.trim()) {
    message.warning('请填写教练姓名')
    return
  }
  if (!isUpdate.value) {
    changeModal.value.id = nextNumericId(dataList.value)
    changeModal.value.click_num = changeModal.value.click_num ?? 0
    changeModal.value.comment_num = changeModal.value.comment_num ?? 0
    changeModal.value.favorite_num = changeModal.value.favorite_num ?? 0
    changeModal.value.enabled = changeModal.value.enabled ?? 1
  }
  changeModal.value.avatar = (changeModal.value.avatar ?? '').trim()
  changeModal.value.age = Number(changeModal.value.age) || 0
  changeModal.value.teach_age = Number(changeModal.value.teach_age) || 0
  saveForm()
  message.success(isUpdate.value ? '已保存修改' : '已新增教练账户')
}

function onSearch() {
  page.value = 1
}

const columns: DataTableColumns<Coach> = [
  { type: 'selection' },
  {
    title: '序号',
    key: 'index',
    width: 64,
    render: (_row, index) => rowIndex(index),
  },
  {
    title: '教练工号',
    key: 'job_no',
    width: 96,
    render: row => coachWorkNo(row.username, row.id),
  },
  {
    title: '教练姓名',
    key: 'name',
    width: 100,
    ellipsis: { tooltip: true },
  },
  { title: '性别', key: 'gender', width: 72 },
  {
    title: '教龄',
    key: 'teach_age',
    width: 72,
    sorter: (a, b) => a.teach_age - b.teach_age,
  },
  {
    title: '联系方式',
    key: 'phone',
    width: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    render: row => renderAvatar(row),
  },
  {
    title: '点击次数',
    key: 'click_num',
    width: 96,
    sorter: (a, b) => (a.click_num ?? 0) - (b.click_num ?? 0),
    render: row => row.click_num ?? 0,
  },
  {
    title: '评论数',
    key: 'comment_num',
    width: 88,
    sorter: (a, b) => (a.comment_num ?? 0) - (b.comment_num ?? 0),
    render: row => row.comment_num ?? 0,
  },
  {
    title: '收藏数',
    key: 'favorite_num',
    width: 88,
    sorter: (a, b) => (a.favorite_num ?? 0) - (b.favorite_num ?? 0),
    render: row => row.favorite_num ?? 0,
  },
  {
    title: '操作',
    key: 'action',
    width: 300,
    fixed: 'right',
    render: (row) => {
      return h(BackRowActions, {
        showComments: true,
        onView: () => onView(row),
        onEdit: () => onEdit(row),
        onComments: () => onComments(),
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
        <n-input v-model:value="filterJobNo" placeholder="教练工号" clearable />
        <n-input v-model:value="filterName" placeholder="教练姓名" clearable />
      </template>
    </BackListToolbar>

    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="tableData"
      :row-key="(row: Coach) => row.id"
      :bordered="true"
      :single-line="false"
      size="small"
      scroll-x="1300"
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
      card-class="!max-w-[560px]"
      @confirm="confirmSave"
      @cancel="closeModal"
    >
      <n-form :model="changeModal" label-width="96px">
        <n-form-item label="教练账号" required>
          <n-input
            v-model:value="changeModal.username"
            :disabled="viewOnly || updateDataIndex >= 0"
            placeholder="如 coach009，工号取数字部分"
          />
        </n-form-item>
        <n-form-item label="密码">
          <n-input
            v-model:value="changeModal.password"
            type="password"
            show-password-on="click"
            :disabled="viewOnly"
          />
        </n-form-item>
        <n-form-item label="教练姓名" required>
          <n-input v-model:value="changeModal.name" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="性别">
          <n-select v-model:value="changeModal.gender" :disabled="viewOnly" :options="genderOptions" />
        </n-form-item>
        <n-form-item label="年龄">
          <n-input-number v-model:value="changeModal.age" class="w-full" :min="1" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="教龄">
          <n-input-number v-model:value="changeModal.teach_age" class="w-full" :min="0" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="联系方式">
          <n-input v-model:value="changeModal.phone" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="简介">
          <n-input v-model:value="changeModal.intro" type="textarea" :rows="3" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="点击次数">
          <n-input-number v-model:value="changeModal.click_num" class="w-full" :min="0" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="评论数">
          <n-input-number v-model:value="changeModal.comment_num" class="w-full" :min="0" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="收藏数">
          <n-input-number v-model:value="changeModal.favorite_num" class="w-full" :min="0" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="头像">
          <n-input v-model:value="changeModal.avatar" :disabled="viewOnly" placeholder="图片 URL，可留空" />
        </n-form-item>
        <n-form-item v-if="changeModal.avatar" label="预览">
          <img :src="changeModal.avatar" class="h-16 w-16 rounded border border-slate-200 object-cover" alt="">
        </n-form-item>
        <n-form-item label="在职">
          <n-switch
            :value="changeModal.enabled === 1"
            :disabled="viewOnly"
            @update:value="(v: boolean) => (changeModal.enabled = v ? 1 : 0)"
          />
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

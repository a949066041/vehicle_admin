<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { Student } from '~/types/driving-school'
import { useMessage } from 'naive-ui'
import { h } from 'vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import { ENROLL_TYPE_OPTIONS } from '~/constants/enroll-type'
import { useStudentStore } from '~/store'
import { nextNumericId } from '~/utils/driving-school'

const message = useMessage()
const store = useStudentStore()
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

const filterAccount = ref('')
const filterName = ref('')
const filterEnrollType = ref<string | null>(null)
const checkedRowKeys = ref<Array<string | number>>([])
const viewOnly = ref(false)

const genderOptions = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
]

const statusOptions = [
  { label: '在训', value: '在训' },
  { label: '毕业', value: '毕业' },
  { label: '停训', value: '停训' },
]

const carTypeOptions = [
  { label: 'C1', value: 'C1' },
  { label: 'C2', value: 'C2' },
]

const filteredList = computed(() => {
  return dataList.value.filter((row) => {
    if (filterAccount.value && !row.username.includes(filterAccount.value.trim()))
      return false
    if (filterName.value && !row.name.includes(filterName.value.trim()))
      return false
    if (filterEnrollType.value && row.enroll_type !== filterEnrollType.value)
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
    return '查看学员'
  return isUpdate.value ? '修改学员' : '新增学员'
})

function rowIndex(index: number) {
  return (page.value - 1) * 10 + index + 1
}

function renderAvatar(row: Student) {
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

function findIndex(row: Student) {
  return dataList.value.findIndex(r => r.id === row.id)
}

function onView(row: Student) {
  viewOnly.value = true
  openModal(row, findIndex(row))
}

function onEdit(row: Student) {
  viewOnly.value = false
  openModal(row, findIndex(row))
}

function onDelete(row: Student) {
  removeData(findIndex(row))
  message.success('已删除')
}

function onAdd() {
  viewOnly.value = false
  openModal({
    gender: '男',
    age: 20,
    car_type: 'C1',
    enroll_type: '仅包初考',
    status: '在训',
    avatar: '',
    password: '123456',
  } as Student)
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
    message.warning('请填写学员账号')
    return
  }
  if (!changeModal.value.name?.trim()) {
    message.warning('请填写学员姓名')
    return
  }
  if (!isUpdate.value) {
    changeModal.value.id = nextNumericId(dataList.value)
    changeModal.value.status = changeModal.value.status ?? '在训'
    changeModal.value.enroll_type = changeModal.value.enroll_type ?? '仅包初考'
  }
  changeModal.value.avatar = (changeModal.value.avatar ?? '').trim()
  changeModal.value.age = Number(changeModal.value.age) || 0
  saveForm()
  message.success(isUpdate.value ? '已保存修改' : '已新增学员')
}

function onSearch() {
  page.value = 1
}

const columns: DataTableColumns<Student> = [
  { type: 'selection' },
  {
    title: '序号',
    key: 'index',
    width: 64,
    render: (_row, index) => rowIndex(index),
  },
  {
    title: '学员账号',
    key: 'username',
    width: 110,
    ellipsis: { tooltip: true },
  },
  {
    title: '学员姓名',
    key: 'name',
    width: 100,
    ellipsis: { tooltip: true },
  },
  { title: '性别', key: 'gender', width: 72 },
  {
    title: '年龄',
    key: 'age',
    width: 72,
    sorter: (a, b) => a.age - b.age,
  },
  {
    title: '手机',
    key: 'phone',
    width: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: '报名类型',
    key: 'enroll_type',
    width: 110,
    render: row => row.enroll_type ?? '-',
  },
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    render: row => renderAvatar(row),
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
        <n-input v-model:value="filterAccount" placeholder="学员账号" clearable />
        <n-input v-model:value="filterName" placeholder="学员姓名" clearable />
        <n-select
          v-model:value="filterEnrollType"
          placeholder="请选择报名类型"
          clearable
          :options="ENROLL_TYPE_OPTIONS"
        />
      </template>
    </BackListToolbar>

    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="tableData"
      :row-key="(row: Student) => row.id"
      :bordered="true"
      :single-line="false"
      size="small"
      scroll-x="1100"
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
        <n-form-item label="学员账号" required>
          <n-input v-model:value="changeModal.username" :disabled="viewOnly || updateDataIndex >= 0" />
        </n-form-item>
        <n-form-item label="密码">
          <n-input
            v-model:value="changeModal.password"
            type="password"
            show-password-on="click"
            :disabled="viewOnly"
          />
        </n-form-item>
        <n-form-item label="学员姓名" required>
          <n-input v-model:value="changeModal.name" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="性别">
          <n-select v-model:value="changeModal.gender" :disabled="viewOnly" :options="genderOptions" />
        </n-form-item>
        <n-form-item label="年龄">
          <n-input-number v-model:value="changeModal.age" class="w-full" :min="1" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="手机">
          <n-input v-model:value="changeModal.phone" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="报名类型">
          <n-select
            v-model:value="changeModal.enroll_type"
            :disabled="viewOnly"
            :options="ENROLL_TYPE_OPTIONS"
          />
        </n-form-item>
        <n-form-item label="报名车型">
          <n-select v-model:value="changeModal.car_type" :disabled="viewOnly" :options="carTypeOptions" />
        </n-form-item>
        <n-form-item label="身份证">
          <n-input v-model:value="changeModal.id_card" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="地址">
          <n-input v-model:value="changeModal.address" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="学员状态">
          <n-select v-model:value="changeModal.status" :disabled="viewOnly" :options="statusOptions" />
        </n-form-item>
        <n-form-item label="头像">
          <n-input v-model:value="changeModal.avatar" :disabled="viewOnly" placeholder="图片 URL，可留空" />
        </n-form-item>
        <n-form-item v-if="changeModal.avatar" label="预览">
          <img :src="changeModal.avatar" class="h-16 w-16 rounded border border-slate-200 object-cover" alt="">
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

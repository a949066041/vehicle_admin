<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { FeeRecord } from '~/types/driving-school'
import { NTag, useMessage } from 'naive-ui'
import { h } from 'vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import { ENROLL_TYPE_OPTIONS } from '~/constants/enroll-type'
import { useFeeStore, useStudentStore } from '~/store'
import { nextNumericId } from '~/utils/driving-school'

const message = useMessage()
const { dataList: students } = useStudentStore()
const store = useFeeStore()
const { RECEIPT_IMG } = store
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

const filterAccount = ref('')
const filterName = ref('')
const filterPayStatus = ref<string | null>(null)
const checkedRowKeys = ref<Array<string | number>>([])
const viewOnly = ref(false)

const payStatusOptions = [
  { label: '待支付', value: '待支付' },
  { label: '已支付', value: '已支付' },
]

const feeTypeOptions = [
  { label: '报名费', value: '报名费' },
  { label: '练车费', value: '练车费' },
  { label: '考试费', value: '考试费' },
  { label: '补考费', value: '补考费' },
]

const filteredList = computed(() => {
  return dataList.value.filter((row) => {
    const st = students.value.find(s => s.id === row.student_id)
    if (filterAccount.value && !(st?.username ?? '').includes(filterAccount.value.trim()))
      return false
    if (filterName.value && !(st?.name ?? '').includes(filterName.value.trim()))
      return false
    if (filterPayStatus.value && row.pay_status !== filterPayStatus.value)
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
    return '查看费用'
  return isUpdate.value ? '修改费用' : '新增费用'
})

function rowIndex(index: number) {
  return (page.value - 1) * 10 + index + 1
}

function studentOf(id: number) {
  return students.value.find(s => s.id === id)
}

function renderPayStatus(status: string) {
  return h(
    NTag,
    {
      size: 'small',
      bordered: false,
      type: status === '已支付' ? 'success' : 'warning',
    },
    { default: () => status },
  )
}

function renderReceipt(row: FeeRecord) {
  const src = row.invoice_image || (row.pay_status === '已支付' ? RECEIPT_IMG : '')
  if (!src)
    return h('span', { class: 'text-slate-400 text-xs' }, '—')
  return h('img', {
    src,
    class: 'h-12 w-12 rounded object-cover border border-slate-200',
    alt: '票据',
  })
}

function findIndex(row: FeeRecord) {
  return dataList.value.findIndex(r => r.id === row.id)
}

function onStudentChange(studentId: number) {
  const st = studentOf(studentId)
  if (st?.enroll_type)
    changeModal.value.enroll_type = st.enroll_type
}

function onView(row: FeeRecord) {
  viewOnly.value = true
  openModal(row, findIndex(row))
}

function onEdit(row: FeeRecord) {
  viewOnly.value = false
  openModal(row, findIndex(row))
}

function onDelete(row: FeeRecord) {
  removeData(findIndex(row))
  message.success('已删除')
}

function onAdd() {
  viewOnly.value = false
  openModal({
    fee_name: '报名费',
    fee_amount: 2500,
    fee_type: '报名费',
    enroll_type: '仅包初考',
    pay_status: '待支付',
    pay_date: '',
    pay_time: null,
    invoice: '',
    invoice_image: '',
  } as FeeRecord)
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
  if (!changeModal.value.student_id) {
    message.warning('请选择学员')
    return
  }
  if (!isUpdate.value) {
    changeModal.value.id = nextNumericId(dataList.value)
    changeModal.value.pay_status = changeModal.value.pay_status ?? '待支付'
  }
  if (changeModal.value.pay_status === '已支付' && !changeModal.value.pay_date) {
    changeModal.value.pay_date = changeModal.value.pay_time?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  }
  if (changeModal.value.pay_status === '已支付' && !changeModal.value.invoice_image) {
    changeModal.value.invoice_image = RECEIPT_IMG
  }
  changeModal.value.fee_amount = Number(changeModal.value.fee_amount) || 0
  saveForm()
  message.success(isUpdate.value ? '已保存' : '费用已设定')
}

function onSearch() {
  page.value = 1
}

const columns: DataTableColumns<FeeRecord> = [
  { type: 'selection' },
  { title: '序号', key: 'index', width: 64, render: (_r, i) => rowIndex(i) },
  {
    title: '学员账号',
    key: 'username',
    width: 100,
    render: r => studentOf(r.student_id)?.username ?? '-',
  },
  {
    title: '学员姓名',
    key: 'name',
    width: 96,
    render: r => studentOf(r.student_id)?.name ?? '-',
  },
  {
    title: '报名类型',
    key: 'enroll_type',
    width: 110,
    render: r => r.enroll_type ?? studentOf(r.student_id)?.enroll_type ?? '-',
  },
  {
    title: '报名费用',
    key: 'fee_amount',
    width: 96,
    sorter: (a, b) => a.fee_amount - b.fee_amount,
    render: r => `¥${r.fee_amount}`,
  },
  {
    title: '缴费时间',
    key: 'pay_date',
    width: 110,
    render: r => r.pay_date || (r.pay_time ? r.pay_time.slice(0, 10) : '-'),
  },
  {
    title: '相关票据',
    key: 'invoice_image',
    width: 80,
    render: r => renderReceipt(r),
  },
  {
    title: '是否支付',
    key: 'pay_status',
    width: 96,
    render: r => renderPayStatus(r.pay_status),
  },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
    render: row => h(BackRowActions, {
      onView: () => onView(row),
      onEdit: () => onEdit(row),
      onDelete: () => onDelete(row),
    }),
  },
]
</script>

<template>
  <div class="back-list-page">
    <BackListToolbar @add="onAdd" @batch-delete="onBatchDelete" @search="onSearch">
      <template #filters>
        <n-input v-model:value="filterAccount" placeholder="学员账号" clearable />
        <n-input v-model:value="filterName" placeholder="学员姓名" clearable />
        <n-select v-model:value="filterPayStatus" placeholder="是否支付" clearable :options="payStatusOptions" />
      </template>
    </BackListToolbar>

    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="tableData"
      :row-key="(row: FeeRecord) => row.id"
      bordered
      size="small"
      scroll-x="1200"
      striped
      :pagination="{ page, pageCount, onUpdatePage }"
    />

    <BackCrudModal
      v-model:show="openModalState"
      :title="modalTitle"
      card-class="!max-w-[560px]"
      @confirm="confirmSave"
      @cancel="closeModal"
    >
      <n-form :model="changeModal" label-width="100px">
        <n-form-item label="学员" required>
          <n-select
            v-model:value="changeModal.student_id"
            :disabled="viewOnly"
            :options="students.map(s => ({ label: `${s.name}（${s.username}）`, value: s.id }))"
            @update:value="onStudentChange"
          />
        </n-form-item>
        <n-form-item label="费用名称">
          <n-input v-model:value="changeModal.fee_name" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="费用类型">
          <n-select v-model:value="changeModal.fee_type" :disabled="viewOnly" :options="feeTypeOptions" tag />
        </n-form-item>
        <n-form-item label="报名类型">
          <n-select v-model:value="changeModal.enroll_type" :disabled="viewOnly" :options="ENROLL_TYPE_OPTIONS" />
        </n-form-item>
        <n-form-item label="报名费用">
          <n-input-number v-model:value="changeModal.fee_amount" class="w-full" :min="0" :step="100" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="是否支付">
          <n-select v-model:value="changeModal.pay_status" :disabled="viewOnly" :options="payStatusOptions" />
        </n-form-item>
        <n-form-item label="缴费时间">
          <n-input v-model:value="changeModal.pay_date" :disabled="viewOnly" placeholder="YYYY-MM-DD" />
        </n-form-item>
        <n-form-item label="凭证编号">
          <n-input v-model:value="changeModal.invoice" :disabled="viewOnly" placeholder="支付后自动生成" />
        </n-form-item>
        <n-form-item label="票据图片">
          <n-input v-model:value="changeModal.invoice_image" :disabled="viewOnly" placeholder="图片 URL，支付后可上传" />
        </n-form-item>
        <n-form-item v-if="changeModal.invoice_image" label="预览">
          <img :src="changeModal.invoice_image" class="h-20 w-20 rounded border object-cover" alt="票据">
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
</style>

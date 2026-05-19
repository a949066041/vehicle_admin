<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { NewsItem } from '~/types/driving-school'
import { useMessage } from 'naive-ui'
import dayjs from 'dayjs'
import { h } from 'vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import { useNewsStore } from '~/store'
import { nextNumericId } from '~/utils/driving-school'

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=320&h=200&fit=crop'

const message = useMessage()
const store = useNewsStore()
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

const filterTitle = ref('')
const filterSummary = ref('')
const checkedRowKeys = ref<Array<string | number>>([])
const viewOnly = ref(false)

const filteredList = computed(() => {
  return dataList.value.filter((row) => {
    if (filterTitle.value && !row.title.includes(filterTitle.value.trim()))
      return false
    if (filterSummary.value && !row.summary.includes(filterSummary.value.trim()))
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
    return '查看公告'
  return isUpdate.value ? '修改公告' : '新增公告'
})

function rowIndex(index: number) {
  return (page.value - 1) * 10 + index + 1
}

function renderCover(row: NewsItem) {
  const src = row.cover || DEFAULT_COVER
  return h('img', {
    src,
    class: 'h-12 w-[88px] rounded object-cover border border-slate-200',
    alt: row.title,
  })
}

function findIndex(row: NewsItem) {
  return dataList.value.findIndex(r => r.id === row.id)
}

function onView(row: NewsItem) {
  viewOnly.value = true
  openModal(row, findIndex(row))
}

function onEdit(row: NewsItem) {
  viewOnly.value = false
  openModal(row, findIndex(row))
}

function onDelete(row: NewsItem) {
  removeData(findIndex(row))
  message.success('已删除')
}

function onAdd() {
  viewOnly.value = false
  openModal({
    title: '',
    summary: '',
    content: '',
    cover: DEFAULT_COVER,
    publish_time: dayjs().format('YYYY-MM-DD HH:mm'),
  } as NewsItem)
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
  if (!changeModal.value.title?.trim()) {
    message.warning('请填写标题')
    return
  }
  if (!isUpdate.value) {
    changeModal.value.id = nextNumericId(dataList.value)
    changeModal.value.publish_time = dayjs().format('YYYY-MM-DD HH:mm')
  }
  changeModal.value.cover = (changeModal.value.cover ?? '').trim() || DEFAULT_COVER
  changeModal.value.summary = changeModal.value.summary ?? ''
  changeModal.value.content = changeModal.value.content ?? ''
  saveForm()
  message.success(isUpdate.value ? '已保存' : '公告已发布')
}

function onSearch() {
  page.value = 1
}

const columns: DataTableColumns<NewsItem> = [
  { type: 'selection' },
  {
    title: '序号',
    key: 'index',
    width: 64,
    render: (_row, index) => rowIndex(index),
  },
  {
    title: '封面',
    key: 'cover',
    width: 100,
    render: row => renderCover(row),
  },
  {
    title: '标题',
    key: 'title',
    minWidth: 180,
    ellipsis: { tooltip: true },
  },
  {
    title: '摘要',
    key: 'summary',
    minWidth: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: '发布时间',
    key: 'publish_time',
    width: 150,
    sorter: (a, b) => a.publish_time.localeCompare(b.publish_time),
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
        <n-input v-model:value="filterTitle" placeholder="公告标题" clearable />
        <n-input v-model:value="filterSummary" placeholder="摘要关键词" clearable />
      </template>
    </BackListToolbar>

    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="tableData"
      :row-key="(row: NewsItem) => row.id"
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
      card-class="!max-w-[640px]"
      @confirm="confirmSave"
      @cancel="closeModal"
    >
      <n-form :model="changeModal" label-width="88px">
        <n-form-item label="标题" required>
          <n-input v-model:value="changeModal.title" :disabled="viewOnly" placeholder="公告标题" />
        </n-form-item>
        <n-form-item label="摘要">
          <n-input v-model:value="changeModal.summary" :disabled="viewOnly" placeholder="简要说明" />
        </n-form-item>
        <n-form-item label="封面图">
          <n-input v-model:value="changeModal.cover" :disabled="viewOnly" placeholder="图片 URL" />
        </n-form-item>
        <n-form-item v-if="changeModal.cover" label="封面预览">
          <img :src="changeModal.cover" class="h-24 w-40 rounded border border-slate-200 object-cover" alt="封面">
        </n-form-item>
        <n-form-item label="发布时间">
          <n-input v-model:value="changeModal.publish_time" :disabled="viewOnly" placeholder="YYYY-MM-DD HH:mm" />
        </n-form-item>
        <n-form-item label="正文">
          <n-input
            v-model:value="changeModal.content"
            type="textarea"
            :rows="6"
            :disabled="viewOnly"
            placeholder="公告详细内容"
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

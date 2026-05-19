<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { Site } from '~/types/driving-school'
import { useMessage } from 'naive-ui'
import { h } from 'vue'
import { useRouter } from 'vue-router'
import BackCrudModal from '~/components/BackCrudModal.vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import BackRowActions from '~/components/back/BackRowActions.vue'
import SiteMapPicker from '~/components/back/SiteMapPicker.vue'
import { useSiteStore } from '~/store'
import { nextNumericId } from '~/utils/driving-school'

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1590674899484-d5640e5c7113?w=320&h=200&fit=crop'

const message = useMessage()
const router = useRouter()
const store = useSiteStore()
const {
  dataList,
  page,
  onUpdatePage,
  removeData,
  openModalState,
  openModal,
  updateTitle,
  closeModal,
  changeModal,
  saveForm,
  updateDataIndex,
  isUpdate,
} = store

const filterName = ref('')
const filterType = ref<string | null>(null)
const checkedRowKeys = ref<Array<string | number>>([])
const viewOnly = ref(false)

const typeOptions = [
  { label: '科目二1', value: '科目二1' },
  { label: '科目二2', value: '科目二2' },
  { label: '科目三1', value: '科目三1' },
]

const filteredList = computed(() => {
  return dataList.value.filter((row) => {
    if (filterName.value && !row.site_name.includes(filterName.value.trim()))
      return false
    if (filterType.value && row.site_type !== filterType.value)
      return false
    return true
  })
})

const tableData = computed(() => {
  const start = (page.value - 1) * 10
  return filteredList.value.slice(start, start + 10)
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredList.value.length / 10)))

function rowIndex(index: number) {
  return (page.value - 1) * 10 + index + 1
}

function renderPhoto(row: Site) {
  const src = row.site_photo || DEFAULT_PHOTO
  return h('img', {
    src,
    class: 'h-12 w-[88px] rounded object-cover border border-slate-200',
    alt: row.site_name,
  })
}

function findIndex(row: Site) {
  return dataList.value.findIndex(r => r.id === row.id)
}

function onView(row: Site) {
  viewOnly.value = true
  openModal(row, findIndex(row))
}

function onEdit(row: Site) {
  viewOnly.value = false
  openModal(row, findIndex(row))
}

function onComments() {
  router.push('/back/review-list')
}

function onDelete(row: Site) {
  removeData(findIndex(row))
  message.success('已删除')
}

function onAdd() {
  viewOnly.value = false
  openModal({
    site_type: '科目二1',
    site_scale: '1000平方米',
    longitude: 115.974,
    latitude: 39.485,
    capacity: 30,
    click_num: 0,
    comment_num: 0,
    favorite_num: 0,
  } as Site)
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
  if (!isUpdate.value) {
    changeModal.value.id = nextNumericId(dataList.value)
    changeModal.value.click_num = changeModal.value.click_num ?? 0
    changeModal.value.comment_num = changeModal.value.comment_num ?? 0
    changeModal.value.favorite_num = changeModal.value.favorite_num ?? 0
  }
  changeModal.value.longitude = Number(changeModal.value.longitude) || 0
  changeModal.value.latitude = Number(changeModal.value.latitude) || 0
  changeModal.value.capacity = Number(changeModal.value.capacity) || 0
  changeModal.value.site_photo = (changeModal.value.site_photo ?? '').trim() || DEFAULT_PHOTO
  saveForm()
}

function onSearch() {
  page.value = 1
}

const columns: DataTableColumns<Site> = [
  { type: 'selection' },
  {
    title: '序号',
    key: 'index',
    width: 64,
    render: (_row, index) => rowIndex(index),
  },
  { title: '场地名称', key: 'site_name', width: 140, ellipsis: { tooltip: true } },
  { title: '场地类型', key: 'site_type', width: 96 },
  { title: '场地规模', key: 'site_scale', width: 110 },
  {
    title: '场地图片',
    key: 'site_photo',
    width: 100,
    render: row => renderPhoto(row),
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
    title: '地址',
    key: 'site_address',
    minWidth: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: '操作',
    key: 'action',
    width: 280,
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
        <n-input v-model:value="filterName" placeholder="场地名称" clearable />
        <n-select
          v-model:value="filterType"
          placeholder="场地类型"
          clearable
          :options="typeOptions"
        />
      </template>
    </BackListToolbar>

    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="tableData"
      :row-key="(row: Site) => row.id"
      :bordered="true"
      :single-line="false"
      size="small"
      scroll-x="1400"
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
      :title="viewOnly ? '查看场地' : updateTitle"
      card-class="!max-w-[640px]"
      @confirm="confirmSave"
      @cancel="closeModal"
    >
      <n-form :model="changeModal" label-width="96px">
        <n-form-item label="场地名称">
          <n-input v-model:value="changeModal.site_name" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="场地类型">
          <n-select
            v-model:value="changeModal.site_type"
            :disabled="viewOnly"
            :options="typeOptions"
            tag
          />
        </n-form-item>
        <n-form-item label="场地规模">
          <n-input v-model:value="changeModal.site_scale" :disabled="viewOnly" placeholder="如 1000平方米" />
        </n-form-item>
        <n-form-item label="地址">
          <n-input v-model:value="changeModal.site_address" type="textarea" :rows="2" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="场地图片">
          <n-input v-model:value="changeModal.site_photo" :disabled="viewOnly" placeholder="图片 URL" />
        </n-form-item>
        <n-form-item label="容纳人数">
          <n-input-number v-model:value="changeModal.capacity" class="w-full" :min="1" :disabled="viewOnly" />
        </n-form-item>
        <n-form-item label="地图标注">
          <SiteMapPicker
            :latitude="changeModal.latitude ?? 39.485"
            :longitude="changeModal.longitude ?? 115.974"
            :read-only="viewOnly"
            @update:latitude="(v) => (changeModal.latitude = v)"
            @update:longitude="(v) => (changeModal.longitude = v)"
          />
        </n-form-item>
        <n-form-item label="简介">
          <n-input v-model:value="changeModal.site_intro" type="textarea" :rows="2" :disabled="viewOnly" />
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

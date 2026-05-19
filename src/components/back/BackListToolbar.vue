<script lang="ts" setup>
const emit = defineEmits<{
  add: []
  batchDelete: []
  search: []
}>()
</script>

<template>
  <div class="back-list-toolbar">
    <div class="back-search-bar">
      <slot name="filters" />
      <n-button type="primary" class="back-search-btn" @click="emit('search')">
        查询
      </n-button>
    </div>
    <div class="back-table-actions">
      <n-button class="back-btn-add" @click="emit('add')">
        + 新增
      </n-button>
      <n-button class="back-btn-del" @click="emit('batchDelete')">
        删除
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.back-list-toolbar {
  margin-bottom: 12px;
}

.back-search-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  padding: 12px 16px;
  background: #f5f7fa;
  border: 1px solid #e8eaed;
  border-radius: 2px;
}

.back-search-bar :deep(.n-input),
.back-search-bar :deep(.n-select) {
  width: 180px;
}

.back-search-btn {
  min-width: 72px;
  --n-color: #4a9ff5 !important;
  --n-color-hover: #3d8ee0 !important;
  --n-border: 1px solid #4a9ff5 !important;
}

.back-table-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.back-btn-add {
  min-width: 88px;
  color: #fff !important;
  background: #7eb8f7 !important;
  border: 1px solid #6aabef !important;
}

.back-btn-del {
  min-width: 72px;
  color: #fff !important;
  background: #17a2b8 !important;
  border: 1px solid #149aad !important;
}
</style>

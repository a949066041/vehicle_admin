<script lang="ts" setup>
withDefaults(defineProps<{
  showEdit?: boolean
  showApply?: boolean
  showComments?: boolean
  showEvaluate?: boolean
  showDelete?: boolean
  applyDisabled?: boolean
  applyLabel?: string
}>(), {
  showEdit: false,
  showApply: false,
  showComments: false,
  showEvaluate: false,
  showDelete: true,
  applyDisabled: false,
  applyLabel: '车辆申请',
})

const emit = defineEmits<{
  view: []
  edit: []
  apply: []
  comments: []
  evaluate: []
  delete: []
}>()
</script>

<template>
  <div class="back-row-actions">
    <button type="button" class="back-act back-act-view" @click="emit('view')">
      查看
    </button>
    <button
      v-if="showEdit"
      type="button"
      class="back-act back-act-edit"
      @click="emit('edit')"
    >
      修改
    </button>
    <button
      v-if="showApply"
      type="button"
      class="back-act back-act-apply"
      :disabled="applyDisabled"
      @click="emit('apply')"
    >
      {{ applyLabel }}
    </button>
    <button
      v-if="showComments"
      type="button"
      class="back-act back-act-comment"
      @click="emit('comments')"
    >
      查看评论
    </button>
    <button
      v-if="showEvaluate"
      type="button"
      class="back-act back-act-evaluate"
      @click="emit('evaluate')"
    >
      教练评价
    </button>
    <n-popconfirm v-if="showDelete" @positive-click="emit('delete')">
      <template #trigger>
        <button type="button" class="back-act back-act-del">
          删除
        </button>
      </template>
      确认删除该记录吗？
    </n-popconfirm>
  </div>
</template>

<style scoped>
.back-row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.back-act {
  min-width: 52px;
  padding: 4px 10px;
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.back-act:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.back-act-view {
  background: #1e4f9a;
}

.back-act-edit {
  background: #4a9ff5;
}

.back-act-apply {
  background: #17a2b8;
}

.back-act-comment {
  background: #3b7ddd;
}

.back-act-evaluate {
  background: #4a9ff5;
}

.back-act-del {
  background: #17a2b8;
}
</style>

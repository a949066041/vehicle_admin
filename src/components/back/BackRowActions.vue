<script lang="ts" setup>
withDefaults(defineProps<{
  showComments?: boolean
  showEdit?: boolean
}>(), {
  showComments: false,
  showEdit: true,
})

const emit = defineEmits<{
  view: []
  edit: []
  comments: []
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
      v-if="showComments"
      type="button"
      class="back-act back-act-comment"
      @click="emit('comments')"
    >
      查看评论
    </button>
    <n-popconfirm @positive-click="emit('delete')">
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

.back-act-view {
  background: #1e4f9a;
}

.back-act-edit {
  background: #4a9ff5;
}

.back-act-comment {
  background: #3b7ddd;
}

.back-act-del {
  background: #17a2b8;
}
</style>

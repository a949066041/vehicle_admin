<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { Student } from '~/types/driving-school'
import { NTag } from 'naive-ui'
import { h } from 'vue'
import BackListToolbar from '~/components/back/BackListToolbar.vue'
import CoachChatDialog from '~/components/coach/CoachChatDialog.vue'
import { useContactMessageStore, useLoginStore, useStudentStore } from '~/store'

const { currentProfile } = useLoginStore()
const { dataList: students } = useStudentStore()
const { threadBetween } = useContactMessageStore()

const cid = computed(() => currentProfile.value?.id ?? 0)

const filterName = ref('')
const page = ref(1)
const showChat = ref(false)
const activeStudent = ref<Student | null>(null)

interface ConversationRow {
  student: Student
  lastContent: string
  lastTime: string
  unread: number
}

const conversations = computed<ConversationRow[]>(() => {
  if (!cid.value)
    return []
  const rows: ConversationRow[] = []
  for (const student of students.value) {
    const thread = threadBetween(cid.value, student.id)
    if (!thread.length)
      continue
    const last = thread[thread.length - 1]!
    const unread = thread.filter(m => m.from_role === '学员' && m.read === 0).length
    rows.push({
      student,
      lastContent: last.image_url ? '[图片]' : last.content,
      lastTime: last.time,
      unread,
    })
  }
  return rows.sort((a, b) => b.lastTime.localeCompare(a.lastTime))
})

const filteredList = computed(() => {
  const q = filterName.value.trim()
  if (!q)
    return conversations.value
  return conversations.value.filter((row) => {
    return row.student.name.includes(q) || row.student.username.includes(q)
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

function openChat(student: Student) {
  activeStudent.value = student
  showChat.value = true
}

function onSearch() {
  page.value = 1
}

const columns: DataTableColumns<ConversationRow> = [
  { title: '序号', key: 'index', width: 64, render: (_r, i) => rowIndex(i) },
  { title: '学员账号', key: 'username', width: 110, render: r => r.student.username },
  { title: '学员姓名', key: 'name', width: 100, render: r => r.student.name },
  { title: '最近消息', key: 'last', ellipsis: { tooltip: true }, render: r => r.lastContent },
  { title: '时间', key: 'time', width: 150, render: r => r.lastTime },
  {
    title: '未读',
    key: 'unread',
    width: 80,
    render: r => (r.unread > 0
      ? h(NTag, { size: 'small', type: 'error', bordered: false }, { default: () => String(r.unread) })
      : '-'),
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
    render: row => h(
      'button',
      {
        type: 'button',
        class: 'coach-msg-contact-btn',
        onClick: () => openChat(row.student),
      },
      '联系',
    ),
  },
]
</script>

<template>
  <div class="back-list-page">
    <h3 class="mb-3 text-lg font-semibold text-slate-800">
      联系学员
    </h3>

    <BackListToolbar hide-add hide-delete @search="onSearch">
      <template #filters>
        <n-input v-model:value="filterName" placeholder="学员姓名/账号" clearable />
      </template>
    </BackListToolbar>

    <n-data-table
      :columns="columns"
      :data="tableData"
      :row-key="(r: ConversationRow) => r.student.id"
      bordered
      size="small"
      striped
      :pagination="{ page, pageCount, onUpdatePage: (p: number) => (page = p) }"
    />

    <n-divider class="!my-6">
      全部学员（发起新会话）
    </n-divider>
    <n-space>
      <n-button
        v-for="s in students"
        :key="s.id"
        size="small"
        quaternary
        type="primary"
        @click="openChat(s)"
      >
        {{ s.username }} · {{ s.name }}
      </n-button>
    </n-space>

    <CoachChatDialog
      v-model:show="showChat"
      :student="activeStudent"
      :coach-id="cid"
    />
  </div>
</template>

<style scoped>
.back-list-page :deep(.n-data-table-th) {
  font-weight: 600;
  background: #f5f7fa !important;
}

:deep(.coach-msg-contact-btn) {
  min-width: 52px;
  padding: 4px 12px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  background: #17a2b8;
  border: none;
  border-radius: 3px;
}

:deep(.coach-msg-contact-btn:hover) {
  background: #149aad;
}
</style>

<script setup lang="ts">
import type { ContactMessage, Student } from '~/types/driving-school'
import { useMessage } from 'naive-ui'
import { useCoachStore, useContactMessageStore } from '~/store'

const props = defineProps<{
  show: boolean
  student: Student | null
  coachId: number
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const message = useMessage()
const { dataList: coaches } = useCoachStore()
const { send, markRead, threadBetween } = useContactMessageStore()

const draft = ref('')
const chatBodyRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const coach = computed(() => coaches.value.find(c => c.id === props.coachId))

const messages = computed(() => {
  if (!props.student || !props.coachId)
    return [] as ContactMessage[]
  return threadBetween(props.coachId, props.student.id)
})

type ChatItem =
  | { kind: 'date', label: string }
  | { kind: 'msg', msg: ContactMessage, isCoach: boolean }

const chatItems = computed<ChatItem[]>(() => {
  const items: ChatItem[] = []
  let lastDate = ''
  for (const msg of messages.value) {
    const dateLabel = msg.time.slice(5, 10)
    if (dateLabel !== lastDate) {
      items.push({ kind: 'date', label: dateLabel })
      lastDate = dateLabel
    }
    const isCoach = msg.from_role === '教练' && msg.from_id === props.coachId
    items.push({ kind: 'msg', msg, isCoach })
  }
  return items
})

function close() {
  emit('update:show', false)
}

function scrollToBottom() {
  nextTick(() => {
    const el = chatBodyRef.value
    if (el)
      el.scrollTop = el.scrollHeight
  })
}

watch(() => props.show, (open) => {
  if (!open || !props.student)
    return
  const unread = messages.value
    .filter(m => m.from_role === '学员' && m.read === 0)
    .map(m => m.id)
  if (unread.length)
    markRead(unread)
  scrollToBottom()
})

watch(messages, () => {
  if (props.show)
    scrollToBottom()
}, { deep: true })

function sendText() {
  if (!props.student || !props.coachId)
    return
  const text = draft.value.trim()
  if (!text) {
    message.warning('请输入内容')
    return
  }
  send({
    from_role: '教练',
    from_id: props.coachId,
    to_role: '学员',
    to_id: props.student.id,
    content: text,
  })
  draft.value = ''
  message.success('已发送')
}

function onPickImage() {
  fileInputRef.value?.click()
}

function onImageSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !props.student || !props.coachId)
    return
  if (!file.type.startsWith('image/')) {
    message.warning('请选择图片文件')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    message.warning('图片不超过 2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    const url = typeof reader.result === 'string' ? reader.result : ''
    if (!url)
      return
    send({
      from_role: '教练',
      from_id: props.coachId,
      to_role: '学员',
      to_id: props.student!.id,
      content: '[图片]',
      image_url: url,
    })
    message.success('图片已发送')
    if (fileInputRef.value)
      fileInputRef.value.value = ''
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <n-modal
    :show="show"
    :mask-closable="true"
    transform-origin="center"
    @update:show="emit('update:show', $event)"
  >
    <div v-if="student" class="coach-chat-dialog">
      <div class="coach-chat-header">
        <span class="coach-chat-title">{{ student.username }}</span>
        <button type="button" class="coach-chat-close" aria-label="关闭" @click="close">
          ×
        </button>
      </div>

      <div ref="chatBodyRef" class="coach-chat-body">
        <template v-for="(item, idx) in chatItems" :key="idx">
          <div v-if="item.kind === 'date'" class="coach-chat-date">
            {{ item.label }}
          </div>
          <div
            v-else
            class="coach-chat-row"
            :class="item.isCoach ? 'is-coach' : 'is-student'"
          >
            <img
              v-if="!item.isCoach"
              :src="student.avatar"
              alt=""
              class="coach-chat-avatar"
            >
            <div class="coach-chat-bubble">
              <img
                v-if="item.msg.image_url"
                :src="item.msg.image_url"
                alt="图片"
                class="coach-chat-img"
              >
              <span v-else>{{ item.msg.content }}</span>
            </div>
            <img
              v-if="item.isCoach"
              :src="coach?.avatar"
              alt=""
              class="coach-chat-avatar"
            >
          </div>
        </template>
        <n-empty v-if="!chatItems.length" class="py-12" description="暂无消息，发送第一条吧" />
      </div>

      <div class="coach-chat-footer">
        <n-input
          v-model:value="draft"
          class="coach-chat-input"
          placeholder="请输入内容"
          @keydown.enter.prevent="sendText"
        />
        <div class="coach-chat-actions">
          <button type="button" class="coach-chat-btn coach-chat-btn-send" @click="sendText">
            发送
          </button>
          <button type="button" class="coach-chat-btn coach-chat-btn-upload" @click="onPickImage">
            上传图片
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onImageSelected"
          >
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.coach-chat-dialog {
  width: min(520px, 92vw);
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgb(0 0 0 / 12%);
}

.coach-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e8eaed;
}

.coach-chat-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.coach-chat-close {
  width: 28px;
  height: 28px;
  font-size: 22px;
  line-height: 1;
  color: #999;
  cursor: pointer;
  background: transparent;
  border: none;
}

.coach-chat-close:hover {
  color: #333;
}

.coach-chat-body {
  height: 360px;
  padding: 16px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e8eaed;
  border-top: none;
  border-bottom: none;
}

.coach-chat-date {
  margin: 8px 0 16px;
  font-size: 12px;
  color: #999;
  text-align: center;
}

.coach-chat-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.coach-chat-row.is-coach {
  flex-direction: row-reverse;
}

.coach-chat-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #e8eaed;
}

.coach-chat-bubble {
  max-width: 72%;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.5;
  border-radius: 6px;
}

.is-student .coach-chat-bubble {
  color: #2e7d32;
  background: #e8f5e9;
}

.is-coach .coach-chat-bubble {
  color: #e65100;
  background: #fff3e0;
}

.coach-chat-img {
  display: block;
  max-width: 200px;
  max-height: 160px;
  border-radius: 4px;
}

.coach-chat-footer {
  padding: 12px 16px 16px;
}

.coach-chat-input {
  width: 100%;
}

.coach-chat-input :deep(.n-input__input-el) {
  min-height: 36px;
}

.coach-chat-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

.coach-chat-btn {
  min-width: 80px;
  padding: 6px 16px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  border: none;
  border-radius: 3px;
}

.coach-chat-btn-send {
  background: #17a2b8;
}

.coach-chat-btn-send:hover {
  background: #149aad;
}

.coach-chat-btn-upload {
  background: #4caf50;
}

.coach-chat-btn-upload:hover {
  background: #43a047;
}

.hidden {
  display: none;
}
</style>

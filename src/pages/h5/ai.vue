<script setup lang="ts">
import { useAiChatStore, useLoginStore } from '~/store'

const { currentProfile } = useLoginStore()
const ai = useAiChatStore()
const input = ref('')

const userKey = computed(() => {
  const p = currentProfile.value
  if (!p)
    return 'guest'
  return `student-${p.id}`
})

const turns = computed(() => ai.sessions.value[userKey.value] ?? [])

function send() {
  if (!input.value.trim())
    return
  ai.ask(userKey.value, input.value)
  input.value = ''
}
</script>

<template>
  <div class="flex min-h-[calc(100dvh-12rem)] flex-col rounded-xl bg-[#f5f5f5]">
    <div class="flex-1 space-y-3 overflow-y-auto px-2 py-2">
      <template v-if="!turns.length">
        <div class="mx-auto mt-6 max-w-[85%] rounded-lg bg-white px-3 py-2 text-center text-xs text-slate-500 shadow-sm">
          您好，我是驾校智能助手，可咨询科目二/三、预约、考试与缴费等问题。
        </div>
      </template>
      <div
        v-for="t in turns"
        :key="t.id"
        class="flex"
        :class="t.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[78%] rounded-lg px-3 py-2 text-[15px] leading-snug shadow-sm"
          :class="t.role === 'user' ? 'rounded-br-sm bg-[#95ec69]' : 'rounded-bl-sm bg-white'"
        >
          {{ t.content }}
        </div>
      </div>
    </div>
    <div class="mt-auto flex items-end gap-2 border-t border-black/6 bg-[#f7f7f7] p-2">
      <n-input
        v-model:value="input"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 4 }"
        placeholder="发送消息…"
        class="flex-1"
        @keydown.enter.prevent.exact="send"
      />
      <n-button type="primary" class="mb-0.5 shrink-0" @click="send">
        发送
      </n-button>
    </div>
  </div>
</template>

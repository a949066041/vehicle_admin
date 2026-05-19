import type { ContactMessage, RoleType } from '~/types/driving-school'
import { createGlobalState, useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { nextNumericId } from '~/utils/driving-school'

/** 与设计图 5.36 一致的教练-学员会话假数据（教练 id=1 王大伟） */
const seedMessages: ContactMessage[] = [
  { id: 1, from_role: '学员', from_id: 1, to_role: '教练', to_id: 1, content: '教练，科二通关秘籍是什么？', time: '2025-04-08 09:12:00', read: 1 },
  { id: 2, from_role: '教练', from_id: 1, to_role: '学员', to_id: 1, content: '控制车速！', time: '2025-04-08 09:15:00', read: 1 },
  { id: 3, from_role: '学员', from_id: 1, to_role: '教练', to_id: 1, content: '好的，谢谢教练。', time: '2025-04-08 09:18:00', read: 0 },
  { id: 4, from_role: '学员', from_id: 2, to_role: '教练', to_id: 1, content: '教练，侧方停车总是压线怎么办？', time: '2025-04-07 14:20:00', read: 0 },
  { id: 5, from_role: '教练', from_id: 1, to_role: '学员', to_id: 2, content: '看后视镜，打方向要稳。', time: '2025-04-07 14:25:00', read: 1 },
  { id: 6, from_role: '学员', from_id: 3, to_role: '教练', to_id: 1, content: '明天可以预约练车吗？', time: '2025-05-10 08:00:00', read: 0 },
  { id: 7, from_role: '教练', from_id: 1, to_role: '学员', to_id: 3, content: '可以，在系统里选我的练车项目。', time: '2025-05-10 08:30:00', read: 1 },
  { id: 8, from_role: '学员', from_id: 4, to_role: '教练', to_id: 1, content: '科三路考有什么注意事项？', time: '2025-05-11 16:00:00', read: 0 },
  { id: 9, from_role: '学员', from_id: 5, to_role: '教练', to_id: 1, content: '倒车入库老是偏左', time: '2025-05-12 10:10:00', read: 0 },
  { id: 10, from_role: '教练', from_id: 1, to_role: '学员', to_id: 5, content: '入库前摆正车身，慢速调整。', time: '2025-05-12 10:20:00', read: 1 },
]

export const useContactMessageStore = createGlobalState(() => {
  const list = useLocalStorage<ContactMessage[]>(
    'driving-school-messages-v2',
    () => seedMessages.map(r => ({ ...r })),
  )

  function send(input: {
    from_role: RoleType
    from_id: number
    to_role: RoleType
    to_id: number
    content: string
    image_url?: string
  }) {
    const row: ContactMessage = {
      id: nextNumericId(list.value),
      from_role: input.from_role,
      from_id: input.from_id,
      to_role: input.to_role,
      to_id: input.to_id,
      content: input.content,
      image_url: input.image_url,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      read: 0,
    }
    list.value = [...list.value, row]
    return row
  }

  function markRead(ids: number[]) {
    const set = new Set(ids)
    list.value = list.value.map(m => (set.has(m.id) ? { ...m, read: 1 as const } : m))
  }

  function threadBetween(coachId: number, studentId: number) {
    return list.value
      .filter((m) => {
        const coachStudent =
          (m.from_role === '教练' && m.from_id === coachId && m.to_role === '学员' && m.to_id === studentId)
          || (m.from_role === '学员' && m.from_id === studentId && m.to_role === '教练' && m.to_id === coachId)
        return coachStudent
      })
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  return { list, send, markRead, threadBetween }
})

import type { DrivingReview } from '~/types/driving-school'
import { createGlobalState, useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { nextNumericId } from '~/utils/driving-school'
import { PRACTICE_PHOTO } from '~/utils/back-audit'

const seedReviews: DrivingReview[] = [
  {
    id: 1,
    student_id: 1,
    coach_id: 1,
    subject: '科二',
    car_type: 'C1',
    practice_photo: PRACTICE_PHOTO,
    student_star: 5,
    student_service_star: 5,
    student_attitude_star: 5,
    student_comment: '教练认真负责',
    coach_star: 5,
    coach_progress_star: 5,
    coach_attitude_star: 5,
    coach_comment: '进步很大，继续努力！',
    student_reply: '谢谢教练',
    coach_reply: '',
    addtime: '2025-04-08 23:56:08',
  },
  {
    id: 2,
    student_id: 6,
    coach_id: 6,
    subject: '科二',
    car_type: 'C1',
    practice_photo: PRACTICE_PHOTO,
    student_star: 4,
    student_service_star: 4,
    student_attitude_star: 5,
    student_comment: '讲解清晰',
    coach_star: 4,
    coach_progress_star: 4,
    coach_attitude_star: 5,
    coach_comment: '基础扎实，继续保持',
    student_reply: '',
    coach_reply: '感谢认可',
    addtime: '2025-04-07 20:10:00',
  },
  {
    id: 3,
    student_id: 7,
    coach_id: 5,
    subject: '科二',
    car_type: 'C2',
    practice_photo: PRACTICE_PHOTO,
    student_star: 5,
    student_service_star: 5,
    student_attitude_star: 4,
    student_comment: '王教练很有耐心',
    coach_star: 5,
    coach_progress_star: 5,
    coach_attitude_star: 5,
    coach_comment: '倒库有进步',
    student_reply: '谢谢王教练',
    coach_reply: '',
    addtime: '2025-04-07 18:18:32',
  },
  {
    id: 4,
    student_id: 8,
    coach_id: 4,
    subject: '科三',
    car_type: 'C2',
    practice_photo: PRACTICE_PHOTO,
    student_star: 5,
    student_service_star: 5,
    student_attitude_star: 5,
    student_comment: '路考指导细致',
    coach_star: 0,
    coach_progress_star: 0,
    coach_attitude_star: 0,
    coach_comment: '',
    student_reply: '',
    coach_reply: '',
    addtime: '2025-04-09 16:30:00',
  },
  {
    id: 5,
    student_id: 2,
    coach_id: 2,
    subject: '科一',
    car_type: 'C1',
    practice_photo: PRACTICE_PHOTO,
    student_star: 4,
    student_service_star: 4,
    student_attitude_star: 4,
    student_comment: '理论辅导有帮助',
    coach_star: 4,
    coach_progress_star: 5,
    coach_attitude_star: 4,
    coach_comment: '模拟成绩不错',
    student_reply: '',
    coach_reply: '继续加油',
    addtime: '2025-04-06 14:22:00',
  },
  {
    id: 6,
    student_id: 3,
    coach_id: 3,
    subject: '科三',
    car_type: 'C2',
    practice_photo: PRACTICE_PHOTO,
    student_star: 5,
    student_service_star: 5,
    student_attitude_star: 5,
    student_comment: '自动挡练车体验好',
    coach_star: 5,
    coach_progress_star: 4,
    coach_attitude_star: 5,
    coach_comment: '路口观察需加强',
    student_reply: '收到',
    coach_reply: '',
    addtime: '2025-04-05 11:08:00',
  },
  {
    id: 7,
    student_id: 4,
    coach_id: 1,
    subject: '科三',
    car_type: 'C1',
    practice_photo: PRACTICE_PHOTO,
    student_star: 5,
    student_service_star: 5,
    student_attitude_star: 5,
    student_comment: '预约练车体验好',
    coach_star: 0,
    coach_progress_star: 0,
    coach_attitude_star: 0,
    coach_comment: '',
    student_reply: '',
    coach_reply: '',
    addtime: '2025-03-22 10:00:00',
  },
]

export const useDrivingReviewStore = createGlobalState(() => {
  const list = useLocalStorage<DrivingReview[]>('driving-school-reviews-v4', () => seedReviews.map(r => ({ ...r })))

  function upsertStudentReview(input: {
    student_id: number
    coach_id: number
    student_star: number
    student_comment: string
    subject?: string
    car_type?: string
    practice_photo?: string
    student_service_star?: number
    student_attitude_star?: number
  }) {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const service = input.student_service_star ?? input.student_star
    const attitude = input.student_attitude_star ?? input.student_star
    const i = list.value.findIndex(r => r.student_id === input.student_id && r.coach_id === input.coach_id)
    if (i >= 0) {
      const r = list.value[i]!
      list.value[i] = {
        ...r,
        ...input,
        student_star: service,
        student_service_star: service,
        student_attitude_star: attitude,
        addtime: now,
      }
    }
    else {
      list.value.push({
        id: nextNumericId(list.value),
        student_id: input.student_id,
        coach_id: input.coach_id,
        subject: input.subject ?? '科二',
        car_type: input.car_type ?? 'C1',
        practice_photo: input.practice_photo ?? PRACTICE_PHOTO,
        student_star: service,
        student_service_star: service,
        student_attitude_star: attitude,
        student_comment: input.student_comment,
        coach_star: 0,
        coach_comment: '',
        student_reply: '',
        coach_reply: '',
        addtime: now,
      })
    }
    list.value = [...list.value]
  }

  function updateCoachFeedback(id: number, patch: Partial<Pick<DrivingReview, 'coach_star' | 'coach_progress_star' | 'coach_attitude_star' | 'coach_comment' | 'coach_reply' | 'student_reply'>>) {
    const i = list.value.findIndex(r => r.id === id)
    if (i < 0)
      return false
    list.value[i] = { ...list.value[i]!, ...patch }
    list.value = [...list.value]
    return true
  }

  function removeReviews(ids: number[]) {
    const set = new Set(ids)
    list.value = list.value.filter(x => !set.has(x.id))
  }

  return { list, upsertStudentReview, updateCoachFeedback, removeReviews }
})

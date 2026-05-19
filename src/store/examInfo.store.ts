import type { ExamInfo } from '~/types/driving-school'
import { createGlobalState } from '@vueuse/core'
import { useCurd } from '~/hooks'
import { EXAM_PHOTO } from '~/utils/back-audit'

/** 与设计图 5.29 一致的考试信息假数据 */
const initData: ExamInfo[] = [
  { id: 1, exam_name: '科目一理论考试', exam_subject: '科一', exam_type: '正式考试', exam_address: '高碑店乐航考场', exam_date: '3月30日', max_num: 8, booked_num: 0, status: '可预约', exam_photo: EXAM_PHOTO },
  { id: 2, exam_name: '科目二模拟考试', exam_subject: '科二', exam_type: '模拟考试', exam_address: '定兴明城考场', exam_date: '3月31日', max_num: 7, booked_num: 3, status: '可预约', exam_photo: EXAM_PHOTO },
  { id: 3, exam_name: '科目三模拟考试', exam_subject: '科三', exam_type: '模拟考试', exam_address: '定兴明城考场', exam_date: '4月2日', max_num: 6, booked_num: 3, status: '可预约', exam_photo: EXAM_PHOTO },
  { id: 4, exam_name: '科目三正式考试', exam_subject: '科三', exam_type: '正式考试', exam_address: '定兴明城考场', exam_date: '4月3日', max_num: 5, booked_num: 4, status: '可预约', exam_photo: EXAM_PHOTO },
  { id: 5, exam_name: '科目四理论考试', exam_subject: '科四', exam_type: '正式考试', exam_address: '高碑店乐航考场', exam_date: '4月7日', max_num: 4, booked_num: 4, status: '已满', exam_photo: EXAM_PHOTO },
  { id: 6, exam_name: '科目二正式考试', exam_subject: '科二', exam_type: '正式考试', exam_address: '定兴明城考场', exam_date: '4月8日', max_num: 3, booked_num: 3, status: '可预约', exam_photo: EXAM_PHOTO },
  { id: 7, exam_name: '科目一模拟考试', exam_subject: '科一', exam_type: '模拟考试', exam_address: '定兴明城考场', exam_date: '4月10日', max_num: 10, booked_num: 2, status: '可预约', exam_photo: EXAM_PHOTO },
  { id: 8, exam_name: '科目四模拟考试', exam_subject: '科四', exam_type: '模拟考试', exam_address: '高碑店乐航考场', exam_date: '4月12日', max_num: 6, booked_num: 1, status: '可预约', exam_photo: EXAM_PHOTO },
]

export const useExamInfoStore = createGlobalState(() => {
  return useCurd<ExamInfo>({ key: 'driving-school-exam-info-v2', initData })
})

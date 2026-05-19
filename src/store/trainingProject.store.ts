import type { TrainingProject } from '~/types/driving-school'
import { createGlobalState } from '@vueuse/core'
import { useCurd } from '~/hooks'
import { PRACTICE_PHOTO } from '~/utils/back-audit'

/** 与设计图 5.26 一致的练车项目假数据 */
const initData: TrainingProject[] = [
  { id: 1, project_name: '科三-朝阳路下午', subject: '科三', car_type: 'C2', site_id: 3, coach_id: 4, car_id: 2, train_date: '2025-04-09', train_time: '14:00-15:00', max_num: 1, booked_num: 1, status: '可预约', book_status: '已预约', practice_photo: PRACTICE_PHOTO, comment_num: 0, favorite_num: 0 },
  { id: 2, project_name: '科三-朝阳路上午', subject: '科三', car_type: 'C2', site_id: 3, coach_id: 4, car_id: 2, train_date: '2025-04-09', train_time: '9:00-10:00', max_num: 1, booked_num: 0, status: '可预约', book_status: '可预约', practice_photo: PRACTICE_PHOTO, comment_num: 0, favorite_num: 0 },
  { id: 3, project_name: '科三-开发区下午', subject: '科三', car_type: 'C2', site_id: 2, coach_id: 5, car_id: 3, train_date: '2025-04-09', train_time: '15:00-16:00', max_num: 1, booked_num: 0, status: '可预约', book_status: '可预约', practice_photo: PRACTICE_PHOTO, comment_num: 0, favorite_num: 0 },
  { id: 4, project_name: '科三-开发区上午', subject: '科三', car_type: 'C2', site_id: 2, coach_id: 5, car_id: 3, train_date: '2025-04-09', train_time: '9:00-10:00', max_num: 1, booked_num: 0, status: '可预约', book_status: '可预约', practice_photo: PRACTICE_PHOTO, comment_num: 0, favorite_num: 0 },
  { id: 5, project_name: '科二-向阳场下午', subject: '科二', car_type: 'C2', site_id: 5, coach_id: 6, car_id: 4, train_date: '2025-04-08', train_time: '15:00-16:00', max_num: 1, booked_num: 1, status: '可预约', book_status: '已预约', practice_photo: PRACTICE_PHOTO, comment_num: 0, favorite_num: 0 },
  { id: 6, project_name: '科二-向阳场上午', subject: '科二', car_type: 'C2', site_id: 5, coach_id: 6, car_id: 4, train_date: '2025-04-08', train_time: '9:00-10:00', max_num: 1, booked_num: 0, status: '可预约', book_status: '可预约', practice_photo: PRACTICE_PHOTO, comment_num: 0, favorite_num: 0 },
  { id: 7, project_name: '科二-长岭场傍晚', subject: '科二', car_type: 'C2', site_id: 6, coach_id: 5, car_id: 3, train_date: '2025-04-07', train_time: '17:00-18:00', max_num: 1, booked_num: 0, status: '可预约', book_status: '可预约', practice_photo: PRACTICE_PHOTO, comment_num: 0, favorite_num: 0 },
  { id: 8, project_name: '科二-长岭场上午', subject: '科二', car_type: 'C2', site_id: 6, coach_id: 5, car_id: 3, train_date: '2025-04-07', train_time: '8:00-9:00', max_num: 1, booked_num: 1, status: '可预约', book_status: '已预约', practice_photo: PRACTICE_PHOTO, comment_num: 0, favorite_num: 0 },
  { id: 9, project_name: '科二-C1长岭下午', subject: '科二', car_type: 'C1', site_id: 6, coach_id: 6, car_id: 5, train_date: '2025-04-07', train_time: '15:00-16:00', max_num: 1, booked_num: 1, status: '可预约', book_status: '已预约', practice_photo: PRACTICE_PHOTO, comment_num: 0, favorite_num: 0 },
  { id: 10, project_name: '科三-花田路上午', subject: '科三', car_type: 'C1', site_id: 4, coach_id: 3, car_id: 6, train_date: '2025-04-02', train_time: '9:00-10:00', max_num: 1, booked_num: 0, status: '可预约', book_status: '可预约', practice_photo: PRACTICE_PHOTO, comment_num: 0, favorite_num: 0 },
  { id: 11, project_name: '科二-总校强化', subject: '科二', car_type: 'C1', site_id: 1, coach_id: 1, car_id: 1, train_date: '2025-05-10', train_time: '09:00-11:00', max_num: 4, booked_num: 2, status: '可预约', book_status: '可预约', practice_photo: PRACTICE_PHOTO, comment_num: 1, favorite_num: 2 },
  { id: 12, project_name: '科三-总校路考', subject: '科三', car_type: 'C2', site_id: 4, coach_id: 4, car_id: 2, train_date: '2025-05-12', train_time: '14:00-16:00', max_num: 3, booked_num: 1, status: '可预约', book_status: '已预约', practice_photo: PRACTICE_PHOTO, comment_num: 0, favorite_num: 1 },
]

export const useTrainingProjectStore = createGlobalState(() => {
  return useCurd<TrainingProject>({ key: 'driving-school-training-projects-v2', initData })
})

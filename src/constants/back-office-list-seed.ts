import type {
  CancelBookingRequest,
  ExamApply,
  PracticeBooking,
  VehicleApplication,
} from '~/types/driving-school'
import dayjs from 'dayjs'

/** 与 trainingProject.store 中 d0/d1 一致，便于后台列表展示日期对齐 */
const d0 = dayjs().add(1, 'day').format('YYYY-MM-DD')
const d1 = dayjs().add(2, 'day').format('YYYY-MM-DD')

/** 车辆申请假数据（车辆 id 1–3、教练 id 1–2） */
export const seedVehicleApplications: VehicleApplication[] = [
  {
    id: 1,
    car_id: 1,
    coach_id: 1,
    apply_date: d0,
    status: '待审核',
    check_remark: '',
    addtime: '2026-05-08 10:12:00',
  },
  {
    id: 2,
    car_id: 2,
    coach_id: 2,
    apply_date: d0,
    status: '已通过',
    check_remark: '车况良好，同意使用',
    addtime: '2026-05-08 11:30:00',
  },
  {
    id: 3,
    car_id: 3,
    coach_id: 1,
    apply_date: d1,
    status: '已驳回',
    check_remark: '该时段车辆已分配科目三',
    addtime: '2026-05-09 09:00:00',
  },
]

/** 练车预约假数据（项目 id 1–3、学员 1–2、教练 1–2） */
export const seedPracticeBookings: PracticeBooking[] = [
  {
    id: 1,
    project_id: 1,
    student_id: 1,
    coach_id: 1,
    appoint_date: d0,
    status: '已通过',
    remark: '科目二强化',
    addtime: '2026-05-08 08:20:00',
  },
  {
    id: 2,
    project_id: 2,
    student_id: 2,
    coach_id: 1,
    appoint_date: d0,
    status: '已取消',
    remark: '后已撤销预约',
    addtime: '2026-05-08 09:05:00',
  },
  {
    id: 3,
    project_id: 3,
    student_id: 1,
    coach_id: 2,
    appoint_date: d1,
    status: '待审核',
    remark: '',
    addtime: '2026-05-10 14:40:00',
  },
  {
    id: 4,
    project_id: 2,
    student_id: 1,
    coach_id: 1,
    appoint_date: '2025-04-09',
    status: '已通过',
    remark: '',
    addtime: '2026-05-12 09:00:00',
  },
]

/** 取消预约假数据（appoint_id 对应上表预约 id） */
export const seedCancelBookings: CancelBookingRequest[] = [
  {
    id: 1,
    appoint_id: 1,
    student_id: 1,
    cancel_reason: '约错了',
    status: '已通过',
    check_remark: '下次注意',
    addtime: '2026-05-11 16:00:00',
  },
  {
    id: 2,
    appoint_id: 2,
    student_id: 2,
    cancel_reason: '身体不适，申请取消',
    status: '已通过',
    check_remark: '同意，已释放名额',
    addtime: '2026-05-08 10:00:00',
  },
  {
    id: 3,
    appoint_id: 3,
    student_id: 1,
    cancel_reason: '想改约至周末时段',
    status: '已驳回',
    check_remark: '请先联系教练改约后再提交',
    addtime: '2026-05-10 15:00:00',
  },
]

/** 考试申请假数据（考试 id 1–2、学员 1–2） */
export const seedExamApplies: ExamApply[] = [
  {
    id: 1,
    exam_id: 1,
    student_id: 1,
    apply_date: d0,
    status: '待审核',
    check_remark: '',
    addtime: '2026-05-09 13:20:00',
  },
  {
    id: 2,
    exam_id: 2,
    student_id: 2,
    apply_date: d0,
    status: '已通过',
    check_remark: '材料齐全',
    addtime: '2026-05-08 15:00:00',
  },
  {
    id: 3,
    exam_id: 1,
    student_id: 2,
    apply_date: d1,
    status: '已驳回',
    check_remark: '科目一未结业，暂不可约',
    addtime: '2026-05-10 09:30:00',
  },
]

/** 论文角色：学员 / 教练 / 管理员 */
export type RoleType = '学员' | '教练' | '管理员'

export interface LoginSession {
  role: RoleType
  account: string
  token: string
}

/** 表4.1 学员 */
export interface Student {
  id: number
  username: string
  password: string
  name: string
  phone: string
  gender: string
  age: number
  id_card: string
  address: string
  car_type: string
  /** 报名类型：包补考 / 仅包初考 */
  enroll_type?: string
  /** 头像（图片 URL，可为空） */
  avatar: string
  /** 在训 / 毕业 / 停训 */
  status: string
  addtime?: string
}

/** 表4.2 教练 */
export interface Coach {
  id: number
  username: string
  password: string
  name: string
  phone: string
  gender: string
  age: number
  teach_age: number
  intro: string
  /** 头像（图片 URL，可为空） */
  avatar: string
  click_num: number
  comment_num?: number
  favorite_num?: number
  /** 1 在职 0 停用 */
  enabled: 0 | 1
  addtime?: string
}

/** 表4.3 管理员 */
export interface AdminUser {
  id: number
  username: string
  password: string
  role: string
  addtime?: string
}

/** 表4.4 车辆 */
export interface Vehicle {
  id: number
  car_name: string
  car_type: string
  car_num: string
  car_photo: string
  car_year?: number
  mileage?: number
  /** 空闲 / 已被申请，见 VehicleStatus 枚举 */
  status: string
  addtime?: string
}

/** 表4.5 场地 */
export interface Site {
  id: number
  site_name: string
  /** 场地类型，如科目二1 */
  site_type?: string
  /** 场地规模，如 1000平方米 */
  site_scale?: string
  site_address: string
  longitude: number
  latitude: number
  site_photo: string
  site_intro: string
  /** 容纳人数 */
  capacity: number
  click_num?: number
  comment_num?: number
  favorite_num?: number
  addtime?: string
}

/** 表4.6 练车项目 */
export interface TrainingProject {
  id: number
  project_name: string
  /** 练车科目，如科二、科三 */
  subject: string
  car_type: string
  site_id: number
  coach_id: number
  car_id?: number
  train_date: string
  train_time: string
  /** 可约人数 */
  max_num: number
  booked_num: number
  /** 可预约 / 已满 / 已结束 */
  status: string
  /** 预约状态：已预约 / 可预约 */
  book_status?: string
  practice_photo?: string
  comment_num?: number
  favorite_num?: number
  addtime?: string
}

/** 表4.7 练车预约 */
export interface PracticeBooking {
  id: number
  project_id: number
  student_id: number
  coach_id: number
  appoint_date: string
  /** 待审核 / 已通过 / 已驳回 / 已取消 */
  status: string
  /** 预约说明 */
  remark: string
  /** 审核回复 */
  check_remark?: string
  addtime?: string
}

/** 表4.8 考试信息 */
export interface ExamInfo {
  id: number
  exam_name: string
  exam_subject: string
  exam_type: string
  exam_address: string
  exam_date: string
  max_num: number
  booked_num: number
  /** 可预约 / 已满 */
  status: string
  exam_photo?: string
  addtime?: string
}

/** 表4.9 考试申请 */
export interface ExamApply {
  id: number
  exam_id: number
  student_id: number
  apply_date: string
  /** 待审核 / 已通过 / 已驳回 */
  status: string
  check_remark: string
  addtime?: string
}

/** 表4.10 费用 */
export interface FeeRecord {
  id: number
  student_id: number
  fee_name: string
  fee_amount: number
  fee_type: string
  /** 待支付 / 已支付 */
  pay_status: string
  pay_time: string | null
  invoice: string
  addtime?: string
}

/** 表4.11 教学资源 */
export interface TeachingResource {
  id: number
  resource_name: string
  resource_type: string
  resource_content: string
  resource_file: string
  coach_id: number | null
  click_num: number
  addtime?: string
}

/** 表4.12 评价（双向） */
export interface DrivingReview {
  id: number
  student_id: number
  coach_id: number
  /** 练车科目，如科二 */
  subject?: string
  /** 练车图片 */
  practice_photo?: string
  student_star: number
  /** 服务质量（星），缺省同 student_star */
  student_service_star?: number
  /** 服务态度（星），缺省同 student_star */
  student_attitude_star?: number
  student_comment: string
  coach_star: number
  /** 学习成果（星），缺省同 coach_star */
  coach_progress_star?: number
  /** 学习态度（星），缺省同 coach_star */
  coach_attitude_star?: number
  coach_comment: string
  student_reply: string
  coach_reply: string
  /** 练车车型展示 */
  car_type?: string
  addtime?: string
}

/** 表4.13 车辆申请 */
export interface VehicleApplication {
  id: number
  car_id: number
  coach_id: number
  apply_date: string
  /** 使用时间展示，如 5月15日 */
  usage_time?: string
  /** 使用说明，如练车 */
  usage_desc?: string
  /** 待审核 / 已通过 / 已驳回 */
  status: string
  check_remark: string
  addtime?: string
}

/** 表4.14 取消预约 */
export interface CancelBookingRequest {
  id: number
  appoint_id: number
  student_id: number
  cancel_reason: string
  /** 待审核 / 已通过 / 已驳回 */
  status: string
  check_remark: string
  addtime?: string
}

/** 表4.15 公告资讯 */
export interface NewsItem {
  id: number
  title: string
  summary: string
  content: string
  cover: string
  publish_time: string
}

/** 联系教练/学员 */
export interface ContactMessage {
  id: number
  from_role: RoleType
  from_id: number
  to_role: RoleType
  to_id: number
  content: string
  time: string
  read: 0 | 1
}

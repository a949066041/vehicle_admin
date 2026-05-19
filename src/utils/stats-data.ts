import type { Coach, FeeRecord, PracticeBooking, Student, TrainingProject } from '~/types/driving-school'
import dayjs from 'dayjs'

const AGE_BUCKETS = [
  { label: '20岁以下', min: 0, max: 19 },
  { label: '20-25岁', min: 20, max: 25 },
  { label: '25-30岁', min: 26, max: 30 },
  { label: '30-35岁', min: 31, max: 35 },
  { label: '35-40岁', min: 36, max: 40 },
  { label: '40岁以上', min: 41, max: 200 },
]

export function countStudentsByAge(students: Student[]) {
  return AGE_BUCKETS.map((b) => {
    const value = students.filter(s => s.age >= b.min && s.age <= b.max).length
    return { name: b.label, value }
  })
}

/** 对称年龄图：左右各一半展示 */
export function symmetricAgeData(students: Student[]) {
  const counts = countStudentsByAge(students)
  return {
    labels: counts.map(c => c.name),
    left: counts.map(c => -c.value),
    right: counts.map(c => c.value),
  }
}

export function countProjectsBySubject(projects: TrainingProject[]) {
  const subject2 = projects.filter(p => p.subject.includes('二') || p.subject === '科目二').length
  const subject3 = projects.filter(p => p.subject.includes('三') || p.subject === '科目三').length
  return [
    { name: '科目二', value: subject2 },
    { name: '科目三', value: subject3 },
  ]
}

export function countStudentsByCarType(students: Student[]) {
  const c1 = students.filter(s => s.car_type === 'C1').length
  const c2 = students.filter(s => s.car_type === 'C2').length
  return { categories: ['C1', 'C2'], values: [c1, c2] }
}

export function countStudentsPerCoach(
  bookings: PracticeBooking[],
  coaches: Coach[],
) {
  const active = bookings.filter(b => b.status !== '已取消' && b.status !== '已驳回')
  return coaches.map((c) => {
    const set = new Set(active.filter(b => b.coach_id === c.id).map(b => b.student_id))
    return { name: c.name, value: set.size }
  })
}

export function monthlyIncomeSeries(fees: FeeRecord[], monthCount = 5) {
  const months = Array.from({ length: monthCount }, (_, i) =>
    dayjs().subtract(monthCount - 1 - i, 'month').format('YYYY-MM'))
  const values = months.map((m) => {
    return fees
      .filter(f => f.pay_status === '已支付' && (f.pay_date ?? f.pay_time ?? '').startsWith(m))
      .reduce((sum, f) => sum + f.fee_amount, 0)
  })
  return {
    labels: months,
    values,
  }
}

export function activeBookingCount(bookings: PracticeBooking[]) {
  return bookings.filter(b => b.status !== '已取消' && b.status !== '已驳回').length
}

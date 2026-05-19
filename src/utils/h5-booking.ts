/** 审核状态展示（设计图：通过 / 待审核） */
export function auditStatusLabel(status: string) {
  if (status === '已通过')
    return '通过'
  if (status === '已驳回')
    return '驳回'
  return status
}

export function subjectShort(subject: string) {
  return subject.replace(/^科目/, '')
}

export function coachWorkNo(username: string, fallbackId: number) {
  const digits = username.replace(/\D/g, '')
  if (digits)
    return digits.padStart(3, '0').slice(-3)
  return String(fallbackId).padStart(3, '0')
}

import { NTag } from 'naive-ui'
import { h } from 'vue'
import { auditStatusLabel } from '~/utils/h5-booking'

export const AUDIT_FILTER_OPTIONS = [
  { label: '待审核', value: '待审核' },
  { label: '通过', value: '已通过' },
  { label: '不通过', value: '已驳回' },
]

export const AUDIT_MODAL_OPTIONS = [
  { label: '通过', value: '已通过' },
  { label: '不通过', value: '已驳回' },
  { label: '待审核', value: '待审核' },
]

export function auditStatusTagType(status: string): 'warning' | 'success' | 'error' | 'default' {
  if (status === '待审核')
    return 'warning'
  if (status === '已通过')
    return 'success'
  if (status === '已驳回')
    return 'error'
  return 'default'
}

export function renderAuditStatus(status: string, variant: 'default' | 'exam' = 'default') {
  return h(
    NTag,
    {
      size: 'small',
      bordered: false,
      type: auditStatusTagType(status),
    },
    { default: () => auditStatusLabel(status, variant) },
  )
}

export const PRACTICE_PHOTO = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=160&h=100&fit=crop'
export const EXAM_PHOTO = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=160&h=100&fit=crop'

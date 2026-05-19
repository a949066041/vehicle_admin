import { coachWorkNo } from '~/utils/h5-booking'

export { coachWorkNo }

export function avatarCell(avatar: string, name: string) {
  if (avatar) {
    return {
      tag: 'img' as const,
      src: avatar,
      class: 'h-10 w-10 rounded object-cover border border-slate-200',
    }
  }
  return {
    tag: 'div' as const,
    text: name.slice(0, 1),
    class: 'flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-sm font-medium text-slate-600',
  }
}

/** 教练收藏数（演示：由点击量推算） */
export function coachFavoriteCount(clickNum: number) {
  return Math.max(0, Math.floor(clickNum / 8))
}

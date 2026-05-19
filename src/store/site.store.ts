import type { Site } from '~/types/driving-school'
import { createGlobalState } from '@vueuse/core'
import { useCurd } from '~/hooks'

const SITE_IMG = 'https://images.unsplash.com/photo-1590674899484-d5640e5c7113?w=320&h=200&fit=crop'

const initData: Site[] = [
  {
    id: 1,
    site_name: '明城总校教练场',
    site_type: '科目二1',
    site_scale: '1000平方米',
    site_address: '河北省保定市涿州市桃园街道107国道东侧',
    longitude: 115.974,
    latitude: 39.485,
    site_photo: SITE_IMG,
    site_intro: '科目二五项综合训练场地，划线清晰。',
    capacity: 40,
    click_num: 21,
    comment_num: 0,
    favorite_num: 6,
  },
  {
    id: 2,
    site_name: '明城分校教练场',
    site_type: '科目二2',
    site_scale: '800平方米',
    site_address: '河北省保定市涿州市开发区永济东路',
    longitude: 115.988,
    latitude: 39.492,
    site_photo: SITE_IMG,
    site_intro: '侧方、曲线行驶专项练习区。',
    capacity: 30,
    click_num: 12,
    comment_num: 1,
    favorite_num: 4,
  },
  {
    id: 3,
    site_name: '朝阳路训练场',
    site_type: '科目二1',
    site_scale: '600平方米',
    site_address: '河北省保定市涿州市朝阳路88号',
    longitude: 115.965,
    latitude: 39.478,
    site_photo: SITE_IMG,
    site_intro: '倒车入库与坡道起步训练。',
    capacity: 25,
    click_num: 8,
    comment_num: 0,
    favorite_num: 2,
  },
  {
    id: 4,
    site_name: '花田路',
    site_type: '科目三1',
    site_scale: '实际道路',
    site_address: '河北省保定市涿州市花田路全段（考试路线）',
    longitude: 116.002,
    latitude: 39.501,
    site_photo: SITE_IMG,
    site_intro: '科目三实际道路驾驶训练。',
    capacity: 15,
    click_num: 4,
    comment_num: 0,
    favorite_num: 3,
  },
]

export const useSiteStore = createGlobalState(() => {
  const curd = useCurd<Site>({ key: 'driving-school-sites-v2', initData })

  function bumpClick(id: number) {
    const i = curd.dataList.value.findIndex(s => s.id === id)
    if (i < 0)
      return
    const s = curd.dataList.value[i]!
    curd.updateData(i, { ...s, click_num: (s.click_num ?? 0) + 1 })
  }

  return { ...curd, bumpClick }
})

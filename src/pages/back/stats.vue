<script setup lang="ts">
import type { ECharts } from 'echarts'
import * as echarts from 'echarts'
import {
  useCoachStore,
  useFeeStore,
  usePracticeBookingStore,
  useStudentStore,
  useTrainingProjectStore,
} from '~/store'
import {
  activeBookingCount,
  countProjectsBySubject,
  countStudentsByAge,
  countStudentsByCarType,
  countStudentsPerCoach,
  monthlyIncomeSeries,
} from '~/utils/stats-data'

const ageRef = ref<HTMLDivElement | null>(null)
const projectRef = ref<HTMLDivElement | null>(null)
const carTypeRef = ref<HTMLDivElement | null>(null)
const coachRef = ref<HTMLDivElement | null>(null)
const incomeRef = ref<HTMLDivElement | null>(null)

const charts: ECharts[] = []

const { dataList: students } = useStudentStore()
const { list: bookings } = usePracticeBookingStore()
const { dataList: fees } = useFeeStore()
const { dataList: projects } = useTrainingProjectStore()
const { dataList: coaches } = useCoachStore()

const studentTotal = computed(() => students.value.length)
const bookingTotal = computed(() => activeBookingCount(bookings.value))
const feeTotal = computed(() => fees.value.length)

function initChart(el: HTMLDivElement | null, option: echarts.EChartsOption) {
  if (!el)
    return
  const chart = echarts.init(el)
  chart.setOption(option)
  charts.push(chart)
}

function renderAll() {
  charts.forEach(c => c.dispose())
  charts.length = 0

  const ageBuckets = countStudentsByAge(students.value)
  initChart(ageRef.value, {
    title: { text: '年龄统计', left: 'center', textStyle: { fontSize: 15, fontWeight: 600 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 48, top: 48, bottom: 28 },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: { type: 'category', data: ageBuckets.map(b => b.name) },
    series: [{
      type: 'bar',
      data: ageBuckets.map(b => b.value),
      itemStyle: {
        color: (params: { dataIndex: number }) => {
          const colors = ['#a8dcc0', '#7ecda0', '#5cb87a', '#7ecda0', '#a8dcc0', '#c5e8d4']
          return colors[params.dataIndex % colors.length]!
        },
      },
      barWidth: 22,
      label: { show: true, position: 'right' },
    }],
  })

  const projectData = countProjectsBySubject(projects.value)
  initChart(projectRef.value, {
    title: { text: '练车项目统计', left: 'center', textStyle: { fontSize: 15, fontWeight: 600 } },
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    color: ['#6ec6f5', '#f0786a'],
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '48%'],
      label: { formatter: '{b}\n{d}%' },
      data: projectData.length ? projectData : [{ name: '暂无', value: 1 }],
    }],
  })

  const car = countStudentsByCarType(students.value)
  initChart(carTypeRef.value, {
    title: { text: '报名车型统计', left: 'center', textStyle: { fontSize: 15, fontWeight: 600 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 24, top: 48, bottom: 32 },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: { type: 'category', data: car.categories },
    series: [{
      type: 'bar',
      data: car.values,
      itemStyle: { color: '#5eb3f6' },
      barWidth: 28,
    }],
  })

  const coachData = countStudentsPerCoach(bookings.value, coaches.value)
  initChart(coachRef.value, {
    title: { text: '教练带学员统计', left: 'center', textStyle: { fontSize: 15, fontWeight: 600 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 16, top: 48, bottom: 56 },
    xAxis: {
      type: 'category',
      data: coachData.map(c => c.name),
      axisLabel: { rotate: 30, interval: 0, fontSize: 11 },
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      type: 'bar',
      data: coachData.map(c => c.value),
      itemStyle: { color: '#4fc3c7' },
      barMaxWidth: 36,
    }],
  })

  const income = monthlyIncomeSeries(fees.value, 5)
  initChart(incomeRef.value, {
    title: { text: '月收入统计', left: 'center', textStyle: { fontSize: 15, fontWeight: 600 } },
    tooltip: { trigger: 'axis', formatter: (p: { value: number }[]) => `¥${p[0]?.value ?? 0}` },
    grid: { left: 56, right: 24, top: 48, bottom: 40 },
    xAxis: { type: 'category', data: income.labels },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      smooth: true,
      data: income.values,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#f0a020', width: 2 },
      itemStyle: { color: '#f0a020' },
      areaStyle: { color: 'rgba(240,160,32,0.12)' },
    }],
  })
}

function onResize() {
  charts.forEach(c => c.resize())
}

onMounted(() => {
  nextTick(() => renderAll())
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  charts.forEach(c => c.dispose())
})

watch(
  [students, bookings, fees, projects, coaches],
  () => nextTick(() => renderAll()),
  { deep: true },
)
</script>

<template>
  <div class="stats-page">
    <div class="stats-banner">
      欢迎使用 明域驾校微信小程序
    </div>

    <n-grid :cols="3" :x-gap="16" class="stats-cards">
      <n-gi>
        <div class="stat-card">
          <div class="stat-card-label">
            学员总数
          </div>
          <div class="stat-card-value">
            {{ studentTotal }}
          </div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-card-label">
            练车预约总数
          </div>
          <div class="stat-card-value">
            {{ bookingTotal }}
          </div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-card-label">
            费用信息总数
          </div>
          <div class="stat-card-value">
            {{ feeTotal }}
          </div>
        </div>
      </n-gi>
    </n-grid>

    <div class="chart-panel chart-panel-full">
      <div ref="ageRef" class="chart-box chart-box-lg" />
    </div>

    <n-grid :cols="2" :x-gap="16" :y-gap="16">
      <n-gi>
        <div class="chart-panel">
          <div ref="projectRef" class="chart-box" />
        </div>
      </n-gi>
      <n-gi>
        <div class="chart-panel">
          <div ref="carTypeRef" class="chart-box" />
        </div>
      </n-gi>
      <n-gi>
        <div class="chart-panel">
          <div ref="coachRef" class="chart-box" />
        </div>
      </n-gi>
      <n-gi>
        <div class="chart-panel">
          <div ref="incomeRef" class="chart-box" />
        </div>
      </n-gi>
    </n-grid>
  </div>
</template>

<style scoped>
.stats-page {
  padding-bottom: 24px;
}

.stats-banner {
  margin-bottom: 16px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 500;
  color: #1e4f7a;
  text-align: center;
  background: linear-gradient(90deg, #e8f4fc 0%, #f0f8ff 50%, #e8f4fc 100%);
  border: 1px solid #d0e8f5;
  border-radius: 4px;
}

.stats-cards {
  margin-bottom: 16px;
}

.stat-card {
  padding: 20px 16px;
  text-align: center;
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 4%);
}

.stat-card-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #64748b;
}

.stat-card-value {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.2;
  color: #1e293b;
}

.chart-panel {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 4%);
}

.chart-panel-full {
  margin-bottom: 16px;
}

.chart-box {
  height: 320px;
  width: 100%;
}

.chart-box-lg {
  height: 340px;
}
</style>

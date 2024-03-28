<script setup>
import { useTheme } from 'vuetify'
import { getLatestBarChartConfig } from '@core/libs/chartjs/chartjsConfig'
import BarChart from '@core/libs/chartjs/components/BarChart'

const props = defineProps({
  labels: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  colors: {
    type: null,
    required: true,
  },
})

const vuetifyTheme = useTheme()
const chartOptions = computed(() => getLatestBarChartConfig(vuetifyTheme.current.value))

const data = {
  labels: props.labels,
  datasets: [{
    maxBarThickness: 15,
    backgroundColor: props.colors.barChartYellow,
    borderColor: 'transparent',
    borderRadius: {
      topRight: 15,
      topLeft: 15,
    },
    data: props.data,
  }],
}
</script>

<template>
  <BarChart
    :height="400"
    :chart-data="data"
    :chart-options="chartOptions"
  />
</template>

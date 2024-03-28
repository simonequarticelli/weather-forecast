<script setup>
import { useTheme } from 'vuetify'
import { getPolarChartConfig } from '@core/libs/chartjs/chartjsConfig'
import PolarAreaChart from '@core/libs/chartjs/components/PolarAreaChart'

const props = defineProps({
  labels: {
    type: Array,
    required: true,
  },
  labelMessage: {
    type: String,
    required: '',
  },
  data: {
    type: Array,
    required: true,
  },
  backgroundColor: {
    type: Array,
    required: true,
  },
})

const vuetifyTheme = useTheme()
const chartConfig = computed(() => getPolarChartConfig(vuetifyTheme.current.value))

const data = {
  labels: props.labels,
  datasets: [{
    borderWidth: 3,
    label: props.labelMessage,
    data: props.data,
    backgroundColor: props.backgroundColor,
  }],
}
</script>

<template>
  <PolarAreaChart
    :height="400"
    :chart-data="data"
    :chart-options="chartConfig"
  />
</template>

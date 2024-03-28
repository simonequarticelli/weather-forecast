<script setup>
import ChartJsBarChart from '@/views/chartjs/ChartJsBarChart.vue'
import ChartJsBubbleChart from '@/views/chartjs/ChartJsBubbleChart.vue'
import ChartJsHorizontalBarChart from '@/views/chartjs/ChartJsHorizontalBarChart.vue'
import ChartJsLineAreaChart from '@/views/chartjs/ChartJsLineAreaChart.vue'
import ChartJsLineChart from '@/views/chartjs/ChartJsLineChart.vue'
import ChartJsRadarChart from '@/views/chartjs/ChartJsRadarChart.vue'
import ChartJsScatterChart from '@/views/chartjs/ChartJsScatterChart.vue'
import ChartJsPolarAreaChart from '@/views/chartjs/ChartJsPolarAreaChart.vue'
import { openWeatherRepository } from "@/repositories/openWeatherRepository"
import { integerValidator, lengthValidator, requiredValidator } from "@validators"

const chartJsCustomColors = {
  white: '#fff',
  yellow: '#ffe802',
  primary: '#836af9',
  areaChartBlue: '#2c9aff',
  barChartYellow: '#ffcf5c',
  polarChartGrey: '#4f5d70',
  polarChartInfo: '#299aff',
  lineChartYellow: '#d4e157',
  polarChartGreen: '#28dac6',
  lineChartPrimary: '#9e69fd',
  lineChartWarning: '#ff9800',
  horizontalBarInfo: '#26c6da',
  polarChartWarning: '#ff8131',
  scatterChartGreen: '#28c76f',
  warningShade: '#ffbd1f',
  areaChartBlueLight: '#84d0ff',
  areaChartGreyLight: '#edf1f4',
  scatterChartWarning: '#ff9f43',
}

const refVForm = ref()
const processing = ref(false)
const city = ref('')
const formError = ref(null)
const isFlatSnackbarVisible = ref(false)

const openWeatherResponse = reactive({
  snow: '',
  rain: '',
  clouds: '',
  humidity: '',
})

const languages = [
  {
    language: 'English',
    abbr: 'EN',
  },
  {
    language: 'Italiano',
    abbr: 'IT',
  },
]

const selectedLanguage = ref({
  language: 'English',
  abbr: 'EN',
})

const filters = reactive({
  weathering: true,
  sunriseSunset: false,
  temperature: false,
})

const request = reactive({
  q: 'Torino',
  zip: '',
  lang: computed(() => selectedLanguage.value.abbr.toLowerCase()),
})

const onReset = () => {
  formError.value = null
  refVForm.value?.reset()
}

onMounted(() => onSubmit())

const onSubmit = () => {
  formError.value = null
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      processing.value = true
      setTimeout(() => {
        openWeatherRepository().index(request).then(response => {
          console.log(response.data)
          openWeatherResponse.clouds = response.data.clouds.all
          openWeatherResponse.humidity = response.data.main.humidity
          openWeatherResponse.rain = response.data?.rain
          openWeatherResponse.snow = response.data?.snow
        }).catch(error => {
          formError.value = error.response.data
          isFlatSnackbarVisible.value = true
        }).finally(() => {
          processing.value = false
          city.value = null
        })
      }, 1000)
    }
  })
}
</script>

<template>
  <VRow id="chartjs-wrapper">
    <VCol cols="12">
      <VForm
        ref="refVForm"
        @submit.prevent="onSubmit"
      >
        <VRow>
          <VCol cols="12">
            <!-- 👉 Flat snackbar -->
            <VSnackbar
              v-model="isFlatSnackbarVisible"
              location="top end"
              :timeout="2000"
              variant="flat"
              color="error"
            >
              {{ formError?.message }}
            </VSnackbar>

            <VRow>
              <!-- 👉 Search bar -->
              <VCol cols="12">
                {{ openWeatherResponse }}
                <AppTextField
                  v-model="request.q"
                  autofocus
                  label="City"
                  placeholder="City"
                />
              </VCol>
              <!-- 👉 Postal code -->
              <VCol cols="12">
                <AppTextField
                  v-model="request.zip"
                  :rules="[integerValidator, lengthValidator(request.postalCode, 5)]"
                  label="Postal code (works only USA locations)"
                  placeholder="Posta code"
                />
              </VCol>
              <!-- 👉 Languages -->
              <VCol cols="12">
                <AppSelect
                  v-model="selectedLanguage"
                  :hint="`${selectedLanguage.language}, ${selectedLanguage.abbr}`"
                  :items="languages"
                  item-title="language"
                  item-value="abbr"
                  label="Language"
                  persistent-hint
                  return-object
                  single-line
                />
              </VCol>
            </VRow>

            <!-- 👉 Actions -->
            <VRow>
              <VCol
                cols="12"
                class="d-flex gap-4"
              >
                <VBtn
                  type="submit"
                  :loading="processing"
                  :disabled="processing"
                >
                  Search
                </VBtn>

                <VBtn
                  color="secondary"
                  variant="tonal"
                  @click="onReset"
                >
                  Reset
                </VBtn>
              </VCol>
            </VRow>

            <!-- 👉 Filters -->
            <VRow>
              <VCol cols="12">
                <VCheckbox
                  v-model="filters.weathering"
                  label="Humidity/Clouds"
                />
                <VCheckbox
                  v-model="filters.sunriseSunset"
                  label="Sunrise/Sunset"
                />
                <VCheckbox
                  v-model="filters.temperature"
                  label="Temperature"
                />
              </VCol>
            </VRow>
          </VCol>
        </VRow>
      </VForm>
    </VCol>

    <template v-if="! processing">
      <!-- 👉 Humidity and Clouds Polar Area Chart -->
      <VCol
        v-if="filters.weathering"
        cols="12"
        md="4"
      >
        <VCard title="Humidity and Clouds">
          <VCardText>
            <ChartJsPolarAreaChart
              :colors="chartJsCustomColors"
              :labels="['Humidity', 'Clouds']"
              label-message="Percentage"
              :data="[openWeatherResponse.humidity, openWeatherResponse.clouds]"
              :background-color="[
                chartJsCustomColors.primary,
                chartJsCustomColors.lineChartWarning,
              ]"
            />
          </VCardText>
        </VCard>
      </VCol>
      <!-- 👉 Rain and Snow Polar Area Chart -->
      <VCol
        v-if="filters.weathering"
        cols="12"
        md="4"
      >
        <VCard title="Rain and Snow">
          <VCardText>
            <ChartJsPolarAreaChart
              v-if="openWeatherResponse.rain || openWeatherResponse.snow"
              :colors="chartJsCustomColors"
              :labels="['Rain', 'Show']"
              label-message="Volume for the last 1 hour, mm."
              :data="[openWeatherResponse.rain, openWeatherResponse.snow]"
              :background-color="[
                chartJsCustomColors.areaChartBlue,
                chartJsCustomColors.polarChartGrey,
              ]"
            />
            <p v-else>Nothing to show</p>
          </VCardText>
        </VCard>
      </VCol>
    </template>

<!--    &lt;!&ndash; 👉 Statistics Line Chart  &ndash;&gt;-->
<!--    <VCol cols="12">-->
<!--      <VCard-->
<!--        title="Statistics"-->
<!--        subtitle="Commercial networks and enterprises"-->
<!--      >-->
<!--        <VCardText>-->
<!--          <ChartJsLineChart :colors="chartJsCustomColors" />-->
<!--        </VCardText>-->
<!--      </VCard>-->
<!--    </VCol>-->

<!--    &lt;!&ndash; 👉 Radar Chart &ndash;&gt;-->
<!--    <VCol-->
<!--      cols="12"-->
<!--      md="6"-->
<!--    >-->
<!--      <VCard title="Radar Chart">-->
<!--        <VCardText>-->
<!--          <ChartJsRadarChart />-->
<!--        </VCardText>-->
<!--      </VCard>-->
<!--    </VCol>-->

<!--    &lt;!&ndash; 👉  Bubble Chart &ndash;&gt;-->
<!--    <VCol cols="12">-->
<!--      <VCard title="Bubble Chart">-->
<!--        <template #append>-->
<!--          <span class="text-subtitle-2">$ 100,000</span>-->
<!--        </template>-->

<!--        <VCardText>-->
<!--          <ChartJsBubbleChart :colors="chartJsCustomColors" />-->
<!--        </VCardText>-->
<!--      </VCard>-->
<!--    </VCol>-->

<!--    &lt;!&ndash; 👉 New Product Data Scatter Chart &ndash;&gt;-->
<!--    <VCol cols="12">-->
<!--      <VCard>-->
<!--        <VCardItem class="d-flex flex-wrap justify-space-between gap-4">-->
<!--          <VCardTitle>New Product Data</VCardTitle>-->

<!--          <template #append>-->
<!--            <VBtnToggle-->
<!--              color="primary"-->
<!--              variant="outlined"-->
<!--              density="compact"-->
<!--            >-->
<!--              <VBtn>Daily</VBtn>-->
<!--              <VBtn>Monthly</VBtn>-->
<!--              <VBtn>Yearly</VBtn>-->
<!--            </VBtnToggle>-->
<!--          </template>-->
<!--        </VCardItem>-->

<!--        <VCardText>-->
<!--          <ChartJsScatterChart :colors="chartJsCustomColors" />-->
<!--        </VCardText>-->
<!--      </VCard>-->
<!--    </VCol>-->

<!--    &lt;!&ndash; 👉 Data Science Area Line Chart &ndash;&gt;-->
<!--    <VCol cols="12">-->
<!--      <VCard>-->
<!--        <VCardItem class="d-flex flex-wrap justify-space-between gap-4">-->
<!--          <VCardTitle>-->
<!--            Data Science-->
<!--          </VCardTitle>-->

<!--          <template #append>-->
<!--            <div class="date-picker-wrapper">-->
<!--              <AppDateTimePicker-->
<!--                model-value="2022-06-09"-->
<!--                prepend-inner-icon="tabler-calendar"-->
<!--                density="compact"-->
<!--                :config="{ position: 'auto right' }"-->
<!--              />-->
<!--            </div>-->
<!--          </template>-->
<!--        </VCardItem>-->

<!--        <VCardText>-->
<!--          <ChartJsLineAreaChart :colors="chartJsCustomColors" />-->
<!--        </VCardText>-->
<!--      </VCard>-->
<!--    </VCol>-->

<!--    &lt;!&ndash; 👉 Latest Statistics &ndash;&gt;-->
<!--    <VCol-->
<!--      cols="12"-->
<!--      md="6"-->
<!--    >-->
<!--      <VCard>-->
<!--        <VCardItem class="d-flex flex-wrap justify-space-between gap-4">-->
<!--          <VCardTitle>Latest Statistics</VCardTitle>-->

<!--          <template #append>-->
<!--            <div class="date-picker-wrapper">-->
<!--              <AppDateTimePicker-->
<!--                model-value="2022-06-09"-->
<!--                prepend-inner-icon="tabler-calendar"-->
<!--                density="compact"-->
<!--                :config="{ position: 'auto right' }"-->
<!--              />-->
<!--            </div>-->
<!--          </template>-->
<!--        </VCardItem>-->

<!--        <VCardText>-->
<!--          <ChartJsBarChart :colors="chartJsCustomColors" />-->
<!--        </VCardText>-->
<!--      </VCard>-->
<!--    </VCol>-->

<!--    &lt;!&ndash; 👉 Balance Horizontal Bar Chart &ndash;&gt;-->
<!--    <VCol-->
<!--      cols="12"-->
<!--      md="6"-->
<!--    >-->
<!--      <VCard>-->
<!--        <VCardItem class="d-flex flex-wrap justify-space-between gap-4">-->
<!--          <VCardTitle>Balance</VCardTitle>-->
<!--          <VCardSubtitle>$74,123</VCardSubtitle>-->

<!--          <template #append>-->
<!--            <div class="date-picker-wrapper">-->
<!--              <AppDateTimePicker-->
<!--                model-value="2022-06-09"-->
<!--                prepend-inner-icon="tabler-calendar"-->
<!--                density="compact"-->
<!--                :config="{ position: 'auto right' }"-->
<!--              />-->
<!--            </div>-->
<!--          </template>-->
<!--        </VCardItem>-->

<!--        <VCardText>-->
<!--          <ChartJsHorizontalBarChart :colors="chartJsCustomColors" />-->
<!--        </VCardText>-->
<!--      </VCard>-->
<!--    </VCol>-->
  </VRow>
</template>

<style lang="scss">
.date-picker-wrapper {
  inline-size: 10.5rem;
}

#chartjs-wrapper {
  .v-card-item__append {
    padding-inline-start: 0;
  }
}
</style>

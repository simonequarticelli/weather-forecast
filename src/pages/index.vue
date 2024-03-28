<script setup>
import ChartJsBarChart from '@/views/chartjs/ChartJsBarChart.vue'
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
const dataNotfound = ref(false)

const restoreInitialState = () => {
  openWeatherResponse.name = ''
  openWeatherResponse.country = ''
  openWeatherResponse.weather.description = ''
  openWeatherResponse.weather.icon = ''
  openWeatherResponse.snow = ''
  openWeatherResponse.rain = ''
  openWeatherResponse.clouds = ''
  openWeatherResponse.humidity = ''
  openWeatherResponse.sunrise = ''
  openWeatherResponse.sunset = ''
  openWeatherResponse.coord.lat = ''
  openWeatherResponse.coord.lon = ''
}

const openWeatherResponse = reactive({
  name: '',
  country: '',
  weather: {
    description: '',
    icon: '',
  },
  snow: '',
  rain: '',
  clouds: '',
  humidity: '',
  sunrise: '',
  sunset: '',
  coord: {
    lat: '',
    lon: '',
  },
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
  humidityAndClouds: true,
  rainAndSnow: false,
  temperature: false,
})

const request = reactive({
  q: 'Torino',
  zip: '',
  lang: computed(() => selectedLanguage.value.abbr.toLowerCase()),
})

const onReset = () => {
  formError.value = null
  request.q = ''
  request.zip = ''
  restoreInitialState()
}

onMounted(() => onSubmit())

const onSubmit = () => {
  formError.value = null
  dataNotfound.value = false
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      processing.value = true
      setTimeout(() => {
        openWeatherRepository().index(request).then(response => {
          openWeatherResponse.name = response.data.name
          openWeatherResponse.country = response.data.sys.country
          openWeatherResponse.weather.description = response.data.weather[0].description
          openWeatherResponse.weather.icon = response.data.weather[0].icon
          openWeatherResponse.clouds = response.data.clouds.all
          openWeatherResponse.humidity = response.data.main.humidity
          openWeatherResponse.rain = response.data.rain !== undefined ? response.data.rain['1h'] : ''
          openWeatherResponse.snow = response.data.snow !== undefined ? response.data.rain['1h'] : ''
          openWeatherResponse.sunrise = new Date(response.data.sys.sunrise * 1000).toLocaleTimeString()
          openWeatherResponse.sunset = new Date(response.data.sys.sunset * 1000).toLocaleTimeString()
          openWeatherResponse.coord.lat = response.data.coord.lat
          openWeatherResponse.coord.lon = response.data.coord.lon
        }).catch(error => {
          dataNotfound.value = true
          formError.value = error.response.data
          isFlatSnackbarVisible.value = true
          restoreInitialState()
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
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="request.q"
                  autofocus
                  label="City"
                  placeholder="City"
                />
              </VCol>
              <!-- 👉 Postal code -->
              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="request.zip"
                  :rules="[integerValidator, lengthValidator(request.postalCode, 5)]"
                  label="Postal code (works only USA locations)"
                  placeholder="Posta code"
                />
              </VCol>
              <!-- 👉 Languages -->
              <VCol
                cols="12"
                md="4"
              >
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
                class="d-flex justify-center gap-4"
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

            <VDivider class="my-9" />

            <!-- 👉 Filters -->
            <VRow>
              <VCol
                v-if="! processing && ! dataNotfound"
                cols="12"
              >
                <VCheckbox
                  v-model="filters.humidityAndClouds"
                  label="Humidity/Clouds"
                />
                <VCheckbox
                  v-model="filters.rainAndSnow"
                  label="Sunrise/Sunset"
                />
              </VCol>
            </VRow>
          </VCol>
        </VRow>
      </VForm>
    </VCol>

    <template v-if="! processing">
      <template v-if="dataNotfound">
        <VCol
          cols="12"
          class="d-flex justify-center"
        >
          <p>Nothing to show</p>
        </VCol>
      </template>
      <template v-else>
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardItem>
              <VCardTitle>{{ openWeatherResponse.name }} {{ openWeatherResponse.country }}</VCardTitle>
            </VCardItem>
            <div class="d-flex align-center">
              <img
                :src="`https://openweathermap.org/img/wn/${openWeatherResponse.weather.icon}.png`"
                alt="weather"
                width="130"
              >
              <VCardText>{{ openWeatherResponse.weather.description }}</VCardText>
            </div>
            <VCardText>
              Sunrise
              <VCardSubtitle class="pa-0">
                {{ openWeatherResponse.sunrise }}
              </VCardSubtitle>
            </VCardText>
            <VCardText>
              Sunset
              <VCardSubtitle class="pa-0">
                {{ openWeatherResponse.sunset }}
              </VCardSubtitle>
            </VCardText>
            <VCardText>
              Latitude
              <VCardSubtitle class="pa-0">
                {{ openWeatherResponse.coord.lat }}
              </VCardSubtitle>
            </VCardText>
            <VCardText>
              Longitude
              <VCardSubtitle class="pa-0">
                {{ openWeatherResponse.coord.lon }}
              </VCardSubtitle>
            </VCardText>
          </VCard>
        </VCol>
        <!-- 👉 Humidity and Clouds Polar Area Chart -->
        <VCol
          v-if="filters.humidityAndClouds"
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
          v-if="filters.rainAndSnow"
          cols="12"
          md="4"
        >
          <VCard title="Rain and Snow">
            <VCardText>
              <ChartJsBarChart
                v-if="openWeatherResponse.rain || openWeatherResponse.snow"
                :colors="chartJsCustomColors"
                :labels="['Rain', 'Show']"
                :data="[openWeatherResponse.rain, openWeatherResponse.snow]"
              />
              <p v-else>Nothing to show</p>
            </VCardText>
          </VCard>
        </VCol>
      </template>
    </template>
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

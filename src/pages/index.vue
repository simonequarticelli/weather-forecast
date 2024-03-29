<script setup>
import ChartJsBarChart from '@/components/chartjs/ChartJsBarChart.vue'
import ChartJsPolarAreaChart from '@/components/chartjs/ChartJsPolarAreaChart.vue'
import { openWeatherRepository } from "@/repositories/openWeatherRepository"
import { integerValidator, lengthValidator } from "@validators"
import { chartJsCustomColors } from "@/components/chartjs/setup/chartJsCustomColors"

const refVForm = ref()
const processing = ref(false)
const city = ref(null)
const formError = ref(null)
const isFlatSnackbarVisible = ref(false)
const dataNotfound = ref(false)

onMounted(() => onSubmit())

/**
 * Function to restore the initial state of the openWeatherResponse object.
 *
 * @function restoreInitialState
 * @returns {void} This function does not return any value.
 */
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

/**
 * Represents the response received from the OpenWeather API.
 *
 * @typedef {object} OpenWeatherResponse
 *
 * @property {string} name - The name of the location.
 * @property {string} country - The country of the location.
 * @property {object} weather - The weather conditions at the location.
 * @property {string} weather.description - The description of the weather.
 * @property {string} weather.icon - The icon representing the weather.
 * @property {string} snow - The snow amount at the location.
 * @property {string} rain - The rain amount at the location.
 * @property {string} clouds - The cloudiness at the location.
 * @property {string} humidity - The humidity at the location.
 * @property {string} sunrise - The time of the sunrise at the location.
 * @property {string} sunset - The time of the sunset at the location.
 * @property {object} coord - The geographical coordinates of the location.
 * @property {string} coord.lat - The latitude of the location.
 * @property {string} coord.lon - The longitude of the location.
 */
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

/**
 * An array that represents supported languages.
 *
 * @type {Array<Object>}
 * @property {string} language - The full name of the language.
 * @property {string} abbr - The abbreviation code for the language.
 */
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

/**
 * Represents a selected language.
 *
 * @typedef {Object} SelectedLanguage
 * @property {string} language - The name of the language.
 * @property {string} abbr - The abbreviation of the language.
 */
const selectedLanguage = ref({
  language: 'Italiano',
  abbr: 'IT',
})

/**
 * A reactive variable that contains different filters for weather conditions.
 *
 * @type {Reactive<{humidityAndClouds: boolean, rainAndSnow: boolean, temperature: boolean}>}
 */
const filters = reactive({
  humidityAndClouds: true,
  rainAndSnow: false,
  temperature: false,
})

/**
 * Represents a reactive variable for making a request.
 *
 * @type {Reactive<{ q: string, zip: string, lang: string }>}
 */
const request = reactive({
  q: 'Torino',
  zip: '',
  lang: computed(() => selectedLanguage.value.abbr.toLowerCase()),
})

/**
 * Resets the form by setting values to null or empty string.
 */
const onReset = () => {
  formError.value = null
  request.q = ''
  request.zip = ''
}

/**
 * Updates the openWeatherResponse object with data from the API response.
 *
 * @param {object} response - The API response object.
 * @returns {void}
 */
const handleResponseData = response => {
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
}

/**
 * Handles the catch block error and performs the necessary operations.
 *
 * @param {Error} error - The error object caught in the catch block.
 */
const handleCatch = error => {
  dataNotfound.value = true
  formError.value = error.response.data
  isFlatSnackbarVisible.value = true
  restoreInitialState()
}

/**
 * Resets the processing value and clears the city value.
 *
 * @function handleFinally
 * @returns {void}
 */
const handleFinally = () => {
  processing.value = false
  city.value = null
}

/**
 * Handles the onSubmit event.
 *
 * This function validates the form, and if it is valid, it calls the openWeatherRepository's
 * index method, passing the request object. It then calls handleResponseData with the response,
 * or handleCatch with the error if an error occurred. Finally, it calls handleFinally.
 *
 * @returns {void}
 */
const onSubmit = () => {
  formError.value = null
  dataNotfound.value = false

  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      processing.value = true

      setTimeout(() => {
        openWeatherRepository().index(request).then(response => {
          handleResponseData(response)
        }).catch(error => {
          handleCatch(error)
        }).finally(() => {
          handleFinally()
        })
      }, 1000) // Set to show the loader 👉 effect NO PROD
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
                class="d-flex align-center gap-4"
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
  #chartjs-wrapper {
    .v-card-item__append {
      padding-inline-start: 0;
    }
  }
</style>

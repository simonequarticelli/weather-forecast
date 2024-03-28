import Repository from "axios"

export function openWeatherRepository() {
  const index = async payload => await Repository.get(`${import.meta.env.VITE_BASE_URL}?APPID=${import.meta.env.VITE_API_KEY}`, { params: payload })

  return {
    index,
  }
}

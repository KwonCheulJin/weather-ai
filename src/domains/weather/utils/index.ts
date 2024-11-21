/**
 * @DIR /src/domains/weather/utils/index.ts
 */

import { WeatherAdapterInterface } from '@/api/weather/types';
import { toZonedTime } from 'date-fns-tz';
/**
 * 3일치 단기예보를 초단기 예보 데이터로 덮어씌우는 함수
 *
 * @param forecast
 * @param short_term_forecast
 * @returns
 */
export const mergeForecastWithShortTermForecast = (
  forecast: Awaited<ReturnType<WeatherAdapterInterface['forecast']>>,
  short_term_forecast: Awaited<
    ReturnType<WeatherAdapterInterface['shortTermForecast']>
  >
) => {
  return forecast.map((item, index) => {
    const date = item.PCP.fcstDate;
    const time = item.PCP.fcstTime;
    const datetime = `${date}_${time}`.toString();
    const short_forecast_item = short_term_forecast?.get(`"${datetime}"`);

    return {
      ...item,
      ...short_forecast_item,
    };
  });
};

const RAINY_TYPE: Readonly<Record<string, string>> = {
  '0': '맑음',
  '1': '비',
  '2': '비/눈',
  '3': '눈',
  '4': '소나기',
  '5': '빗방울',
  '6': '빗방울눈날림',
  '7': '눈날림',
};

export function getRainyType(value: string | undefined) {
  if (value === undefined) {
    return '';
  }
  return RAINY_TYPE[value];
}

export function getCloudType(value: string | undefined) {
  if (value === undefined) {
    return 'Loading';
  }

  const parsed_value = parseInt(value);

  if (0 <= parsed_value && parsed_value < 6) {
    return '맑음';
  }

  if (6 <= parsed_value && parsed_value < 9) {
    return '구름 많음';
  }

  return '흐림';
}

export function getKoreaTime(date?: Date): Date {
  const koreaTimeZone = 'Asia/Seoul';
  const now = date ?? new Date();
  const koreaTime = toZonedTime(now, koreaTimeZone);
  return koreaTime;
}

export const getWeatherTimeToString = (time: number) => {
  if (time >= 5 && time < 12) return '오전';
  if (time >= 12 && time < 16) return '오후';
  if (time >= 16 && time < 19) return '저녁';
  return '밤';
};

const weatherCodeMap: Readonly<Record<string, string>> = {
  '0': 'bright and unobstructed view of the sky.',
  '1': 'dark clouds with streaks of rain falling.',
  '2': 'a mix of rain and snow falling under gray skies.',
  '3': 'soft snowflakes gently falling from pale gray skies.',
  '4': 'short bursts of rain under partly cloudy skies.',
  '5': 'a few light raindrops falling with occasional breaks in the clouds.',
  '6': 'a combination of raindrops and snowflakes drifting through the air.',
  '7': 'light snowflakes swirling in the breeze.',
};

const weatherTimeMap: Readonly<Record<string, string>> = {
  오전: 'morning sky with gentle sunlight breaking through, creating a fresh atmosphere.',
  오후: 'bright afternoon sky with clear visibility and strong sunlight.',
  저녁: 'sunset sky with rich golden hues melting into the horizon.',
  밤: 'night sky with twinkling stars and moonlight casting soft shadows.',
};

export function getWeatherPrompt(weatherCode: string): string {
  const koreaTime = getKoreaTime().getHours();
  let timeDescription = weatherTimeMap[getWeatherTimeToString(koreaTime)];
  let weatherDescription =
    weatherCodeMap[weatherCode] ?? 'neutral weather conditions.';

  return `A realistic sky background for a weather app, showing ${timeDescription} The weather is ${weatherDescription}`;
}

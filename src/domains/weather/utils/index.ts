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

export function getWeatherPrompt(weatherCode: string): string {
  const koreaTime = getKoreaTime().getHours();
  let timeDescription = '';
  let weatherDescription = '';

  // 시간대에 따른 묘사
  if (koreaTime >= 6 && koreaTime < 9) {
    timeDescription =
      'soft pastel colors like pink, orange, and pale blue, with gentle sunlight.';
  } else if (koreaTime >= 12 && koreaTime < 15) {
    timeDescription = 'a vibrant blue sky with fluffy white clouds.';
  } else if (koreaTime >= 18 && koreaTime < 20) {
    timeDescription =
      'warm tones of orange, pink, and purple blending into night.';
  } else {
    timeDescription = 'a deep navy blue sky with visible stars and the moon.';
  }

  // 날씨 코드에 따른 묘사
  switch (weatherCode) {
    case '0': // 맑음
      weatherDescription = 'bright and unobstructed view of the sky.';
      break;
    case '1': // 비
      weatherDescription = 'dark clouds with streaks of rain falling.';
      break;
    case '2': // 비/눈
      weatherDescription = 'a mix of rain and snow falling under gray skies.';
      break;
    case '3': // 눈
      weatherDescription =
        'soft snowflakes gently falling from pale gray skies.';
      break;
    case '4': // 소나기
      weatherDescription = 'short bursts of rain under partly cloudy skies.';
      break;
    case '5': // 빗방울
      weatherDescription =
        'a few light raindrops falling with occasional breaks in the clouds.';
      break;
    case '6': // 빗방울눈날림
      weatherDescription =
        'a combination of raindrops and snowflakes drifting through the air.';
      break;
    case '7': // 눈날림
      weatherDescription = 'light snowflakes swirling in the breeze.';
      break;
    default: // 알 수 없는 날씨
      weatherDescription = 'neutral weather conditions.';
      break;
  }

  return `A realistic sky background for a weather app, showing ${timeDescription} The weather is ${weatherDescription}`;
}

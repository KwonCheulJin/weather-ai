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
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GridCoordinates {
  x: number;
  y: number;
}

interface ExcelGridData {
  구분: string;
  행정구역코드: string;
  '1단계': string;
  '2단계': string;
  '3단계': string;
  '격자 X': string;
  '격자 Y': string;
  '경도(시)': string;
  '경도(분)': string;
  '경도(초)': string;
  '위도(시)': string;
  '위도(분)': string;
  '위도(초)': string;
  '경도(초/100)': string;
  '위도(초/100)': string;
}
const DEFAULT_LOCATION = {
  latitude: 37.5665, // 서울시청 위도
  longitude: 126.978, // 서울시청 경도
};
function getCurrentPosition(): Promise<Coordinates> {
  if (process.env.NODE_ENV === 'development') {
    return Promise.resolve({
      ...DEFAULT_LOCATION,
      accuracy: 0,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    });
  }
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

function convertToGrid(lat: number, lon: number): GridCoordinates {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  let x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  let y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { x, y };
}

// function findNearestGridPoint(
//   targetX: number,
//   targetY: number,
//   gridData: ExcelGridData[]
// ): ExcelGridData {
//   return gridData.reduce((nearest, current) => {
//     const currentDist: number =
//       Math.pow(parseInt(current['격자 X']) - targetX, 2) +
//       Math.pow(parseInt(current['격자 Y']) - targetY, 2);
//     const nearestDist: number =
//       Math.pow(parseInt(nearest['격자 X']) - targetX, 2) +
//       Math.pow(parseInt(nearest['격자 Y']) - targetY, 2);

//     return currentDist < nearestDist ? current : nearest;
//   });
// }

// export const readExcelFile = (): ExcelGridData[] => {
//   const filePath = './data.xlsx';
//   const workbook = XLSX.readFile(filePath);
//   const sheetName = workbook.SheetNames[0];
//   const worksheet = workbook.Sheets[sheetName];
//   const data = XLSX.utils.sheet_to_json(worksheet);
//   return data as ExcelGridData[];
// };

export async function getWeatherForCurrentLocation() {
  try {
    // 1. 현재 위치 가져오기
    const position = await getCurrentPosition();

    // 2. 위경도를 격자 좌표로 변환
    const grid = convertToGrid(position.latitude, position.longitude);

    // 3. 엑셀 데이터에서 가장 가까운 격자점 찾기
    // const nearestPoint = findNearestGridPoint(grid.x, grid.y, readExcelFile());
    console.log(
      '🚀 ~ getWeatherForCurrentLocation ~ grid.x, grid.y:',
      grid.x,
      grid.y
    );

    // 4. 해당 격자점으로 날씨 API 호출

    // return weatherData;
  } catch (error) {
    console.error('Error getting weather:', error);
    throw error;
  }
}

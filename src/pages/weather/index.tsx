import { Weather, WeatherAdapter } from '@/api/weather';
import WeatherMain from '@/domains/weather';
import {
  getRainyType,
  mergeForecastWithShortTermForecast,
} from '@/domains/weather/utils';
import dayjs from 'dayjs';
import { GetStaticProps } from 'next/types';
import OpenAI from 'openai';
import { ComponentProps } from 'react';

interface Props extends ComponentProps<typeof WeatherMain> {}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const weather_instance = new Weather(60, 122);
  const weather = new WeatherAdapter(weather_instance);

  const promise = [
    weather.live(),
    weather.todayTemperature(),
    weather.forecast(),
    weather.shortTermForecast(),
  ] as const;

  const [live, today_temperature, forecast, short_term_forecast] =
    await Promise.all(promise);

  const merged_forecast = mergeForecastWithShortTermForecast(
    forecast,
    short_term_forecast
  );

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const sky = getRainyType(live.PTY.obsrValue);
  const prompt = `하늘 정보를 바탕으로 ${sky} 하늘 풍경 사진을 현재 한국 시간에 맞게 그려봐`;
  const images = await openai.images.generate({
    model: 'dall-e-2',
    n: 1,
    quality: 'standard',
    size: '256x256',
    prompt,
    response_format: 'b64_json',
  });
  const image = images.data.at(0)?.b64_json;
  return {
    props: {
      live,
      today_temperature,
      merged_forecast,
      update_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      image,
    },
  };
};

export default function WeatherPage(props: Props) {
  return <WeatherMain {...props} />;
}

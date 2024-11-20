import { Weather, WeatherAdapter } from '@/api/weather';
import WeatherMain from '@/domains/weather';
import { mergeForecastWithShortTermForecast } from '@/domains/weather/utils';
import { GetStaticProps } from 'next/types';
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
  return {
    props: { live, today_temperature, merged_forecast },
  };
};

export default function WeatherPage(props: Props) {
  return <WeatherMain {...props} />;
}

import { WeatherAdapterInterface } from '@/api/weather/types';
import { mergeForecastWithShortTermForecast } from '@/domains/weather/utils';

interface Props {
  live: Awaited<ReturnType<WeatherAdapterInterface['live']>>;
  today_temperature: Awaited<
    ReturnType<WeatherAdapterInterface['todayTemperature']>
  >;
  merged_forecast: ReturnType<typeof mergeForecastWithShortTermForecast>;
}

export default function WeatherMain(props: Props) {
  const { live, today_temperature, merged_forecast } = props;
  console.log('🚀 ~ WeatherMain ~ merged_forecast:', {
    merged_forecast,
  });
  return (
    <main>
      <h1>Weather Main</h1>
    </main>
  );
}

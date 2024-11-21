import { WeatherAdapterInterface } from '@/api/weather/types';
import ForecastSection from '@/domains/weather/ForecastSection';
import Header from '@/domains/weather/Header';
import BackgroundImage from '@/domains/weather/Header/BackgroundImage';
import LiveSection from '@/domains/weather/LiveSection';
import { mergeForecastWithShortTermForecast } from '@/domains/weather/utils';

interface Props {
  live: Awaited<ReturnType<WeatherAdapterInterface['live']>>;
  today_temperature: Awaited<
    ReturnType<WeatherAdapterInterface['todayTemperature']>
  >;
  merged_forecast: ReturnType<typeof mergeForecastWithShortTermForecast>;
  update_time: string;
  image_data_url?: string;
}

export default function WeatherMain(props: Props) {
  const {
    live,
    today_temperature,
    merged_forecast,
    update_time,
    image_data_url,
  } = props;

  return (
    <main>
      <BackgroundImage image_data_url={image_data_url} />
      <Header update_time={update_time} />
      <LiveSection live={live} today_temperature={today_temperature} />
      <ForecastSection forecast_list={merged_forecast} />
    </main>
  );
}

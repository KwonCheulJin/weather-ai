import WindDirection from '@/domains/weather/component/WindDirection';
import {
  getCloudType,
  mergeForecastWithShortTermForecast,
} from '@/domains/weather/utils';
import dayjs, { Dayjs } from 'dayjs';

interface Props {
  forecast_list: ReturnType<typeof mergeForecastWithShortTermForecast>;
}
export default function ForecastSection(props: Props) {
  const { forecast_list } = props;
  return (
    <section>
      <ol>
        <li>일시</li>
        <li>하늘</li>
        <li>기온</li>
        <li>강수확률</li>
        <li>강수량</li>
        <li>습도</li>
        <li>풍향</li>
        <li>풍속</li>
        {forecast_list.map((item, index) => {
          const date = item.TMP.fcstDate;
          const time = item.TMP.fcstTime;
          const dateTime = dayjs(`${date} ${time}`);
          const diff = formatDiffDays(dateTime);
          return (
            <li key={`forecast-${dateTime.toString()}`}>
              <span>{diff}</span>
              <span>{getCloudType(item.SKY.fcstValue)}</span>
              <span>{item.TMP.fcstValue}℃</span>
              <span>{item.POP.fcstValue}%</span>
              <span>{item.PCP.fcstValue}mm</span>
              <span>{item.REH.fcstValue}%</span>
              <WindDirection direction={parseInt(item.VEC.fcstValue ?? '0')} />
              <span>{item.UUU.fcstValue}(m/s)</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function formatDiffDays(datetime: Dayjs) {
  const diff = dayjs(datetime).diff(dayjs(), 'day');

  switch (diff) {
    case 0:
      return '오늘';
    case 1:
      return '내일';
    case 2:
      return '모레';
    default:
      return `${diff}일 후`;
  }
}

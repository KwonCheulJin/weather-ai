import { WeatherAdapterInterface } from '@/api/weather/types';
import WindDirection from '@/domains/weather/component/WindDirection';

import { getRainyType } from '@/domains/weather/utils';

interface Props {
  live: Awaited<ReturnType<WeatherAdapterInterface['live']>>;
  today_temperature: Awaited<
    ReturnType<WeatherAdapterInterface['todayTemperature']>
  >;
}
export default function LiveSection(props: Props) {
  const { live, today_temperature } = props;
  return (
    <section>
      <div>
        <div>
          {/* 현재 기온, 강수여부 */}
          <strong>{live.T1H?.obsrValue}</strong>
          <strong>{getRainyType(live.PTY?.obsrValue)}</strong>
        </div>
        <div>
          {/* 최저, 최고 기온 */}
          <dl>
            <dt>최저</dt>
            <dd>
              <strong>{today_temperature.min}℃</strong>
            </dd>
          </dl>
          <dl>
            <dt>최고</dt>
            <dd>
              <strong>{today_temperature.max}℃</strong>
            </dd>
          </dl>
          <span>(오전 6시, 오후 3시)</span>
        </div>
      </div>
      <div>
        {/* 강수량, 습도, 풍향, 풍속 */}
        <dl>
          <dt>강수량</dt>
          <dd>
            <strong>{live.RN1?.obsrValue}mm</strong>
          </dd>
        </dl>
        <dl>
          <dt>습도</dt>
          <dd>
            <strong>{live.REH?.obsrValue}%</strong>
          </dd>
        </dl>
        <dl>
          <dt>풍향</dt>
          <dd>
            <strong>{live.VEC?.obsrValue}</strong>
            <WindDirection direction={parseInt(live.VEC?.obsrValue ?? '0')} />
          </dd>
        </dl>
        <dl>
          <dt>풍속</dt>
          <dd>
            <strong>{live.WSD?.obsrValue}(m/s)</strong>
          </dd>
        </dl>
      </div>
    </section>
  );
}

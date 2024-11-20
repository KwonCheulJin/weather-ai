import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
interface Props {
  update_time: string;
}

dayjs.extend(relativeTime);
export default function Header(props: Props) {
  const { update_time } = props;
  return (
    <header>
      <h1>Weather</h1>
      <span>{dayjs(update_time).fromNow()}</span>
    </header>
  );
}

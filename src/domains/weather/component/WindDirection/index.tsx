import Image from 'next/image';
import arrow from './arrow.svg';
interface Props {
  direction: number;
}
export default function WindDirection(props: Props) {
  const { direction } = props;
  return (
    <div
      role="presentation"
      aria-label={`${direction}deg`}
      style={{
        width: 'fit-content',
        rotate: `${direction}deg`,
      }}
    >
      <Image src={arrow} fill={false} width={18} height={18} alt="arrow icon" />
    </div>
  );
}

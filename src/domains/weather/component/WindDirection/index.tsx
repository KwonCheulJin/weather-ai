interface Props {
  direction: number;
}
export default function WindDirection(props: Props) {
  const { direction } = props;
  return (
    <div role="presentation" aria-label={`${direction}deg`}>
      <span>↑</span>
    </div>
  );
}

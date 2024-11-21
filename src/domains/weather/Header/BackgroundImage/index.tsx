import Image from 'next/image';
import styles from './index.module.css';
interface Props {
  image_data_url?: string;
}
export default function BackgroundImage({ image_data_url }: Props) {
  if (!image_data_url) {
    return null;
  }
  return (
    <div className={styles.container}>
      <Image
        src={image_data_url}
        alt="weather"
        fill={true}
        sizes="100vw"
        className={styles.image}
      />
    </div>
  );
}

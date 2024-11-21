import styles from './index.module.css';
interface Props extends React.PropsWithChildren {}

export default function Layout({ children }: Props) {
  return <div className={styles.container}>{children}</div>;
}

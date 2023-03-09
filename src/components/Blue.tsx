import styles from "./style.module.css";
import { useWaffleScroll } from "../hooks/useWaffleScroll";
import { roundBy } from "../hooks/calculate";

function Blue() {
  const {
    ref,
    scrollState: { progress },
  } = useWaffleScroll(
    ({ progress, setScrollState }) => {
      setScrollState({ progress: progress });
    },
    {
      progress: 0,
    },
  );

  return (
    <div className={styles.Blue} ref={ref}>
      <div>진행도:{progress}</div>
      <div>상태:</div>
    </div>
  );
}
export default Blue;

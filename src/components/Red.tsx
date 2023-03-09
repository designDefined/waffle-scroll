import styles from "./style.module.css";
import { useWaffleScroll } from "../hooks/useWaffleScroll";

function Red() {
  const { ref, scrollState } = useWaffleScroll<{
    progress: number;
    available: boolean;
  }>(
    ({ progress, setScrollState, toggleState }) => {
      setScrollState({ progress });
      toggleState(2.2, 2.5, "available");
    },
    { progress: 0, available: false },
  );

  return (
    <div className={styles.Red} ref={ref}>
      <div>진행도: {scrollState.progress}</div>
      <div>상태: {scrollState.available ? "활성화" : "비활성화"}</div>
    </div>
  );
}
export default Red;

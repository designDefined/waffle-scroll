import styles from "./style.module.css";
import { useWaffleScroll } from "../hooks/useWaffleScroll";
import { useEffect } from "react";
function Red() {
  const { ref, scrollState } = useWaffleScroll<{ available: "yes" | "no" }>(
    ({ progress, setScrollState }) => {
      if (progress > 2.5) {
        setScrollState({ available: "yes" });
      } else {
        setScrollState({ available: "no" });
      }
    },
    { available: "no" },
  );
  return (
    <div className={styles.Red} ref={ref}>
      <div>진행도: {scrollState.available}</div>
      <div>상태: {scrollState.available}</div>
    </div>
  );
}
export default Red;

import styles from "./style.module.css";
import { useEffect } from "react";
import useWaffleScroll from "../final";

function Global() {
  const { ref, globalState } = useWaffleScroll(() => {}, {}, ["redPassed"]);
  useEffect(() => {}, [globalState]);

  return (
    <div ref={ref} className={styles.Global}>
      현재:{globalState?.redPassed ? "빨강 지남" : "안지남"}
    </div>
  );
}

export default Global;

import styles from "./style.module.css";
import { useEffect } from "react";
import { useHeader2ScrollState, useHeaderScrollState } from "./scroll";

function Global() {
  const header = useHeaderScrollState();
  const header2 = useHeader2ScrollState();

  useEffect(() => {
    console.count("rerender");
  });
  return <div className={styles.Global}>현재: {header.current}</div>;
}

export default Global;

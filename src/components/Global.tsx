import styles from "./style.module.css";
import { useEffect } from "react";

function Global() {
  useEffect(() => {
    console.count("rerender");
  });
  return <div className={styles.Global}>현재:</div>;
}

export default Global;

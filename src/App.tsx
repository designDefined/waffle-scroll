import "./App.css";
import Red from "./components/Red";
import Blue from "./components/Blue";
import Global from "./components/Global";
import { useEffect, useRef } from "react";
import { useTestScroll } from "./components/hooks";

function App() {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  const { targetRef, globalState } = useTestScroll(
    ({ getGlobal, setGlobal, progress }) => {
      setGlobal({ progress });
    },
  );

  /*
  useEffect(() => {
    if (ref1.current && ref2.current) {
      ref1.current.addEventListener("scroll", (e) => {
        if (ref1.current) console.log(ref1.current.scrollTop);
      });
    }
  }, [ref1, ref2]);
   */

  return (
    <div className="App">
      {/*
      <Red />
      <Blue />
      <Global />
      */}
      <div className="progress">{globalState.progress}</div>
      <div className="parent" ref={targetRef}>
        parent
        <div className="scrollChild" ref={ref1}>
          <div className="mini" ref={ref2}></div>
        </div>
      </div>
    </div>
  );
}

export default App;

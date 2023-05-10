import "./App.css";
import Red from "./components/Red";
import Blue from "./components/Blue";
import Global from "./components/Global";
import { useEffect, useRef } from "react";
import { load, useNestedScroll, useTestScroll } from "./components/hooks";

function App() {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  const { targetRef, globalState } = useTestScroll();
  const { targetRef: nestedRef, globalState: nestedState } = useNestedScroll();

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
      <div className="progress">{nestedState.progress}</div>
      <div className="parent" ref={targetRef}>
        parent
        <div className="scrollChild" ref={load}>
          <div className="mini" ref={nestedRef}></div>
        </div>
      </div>
    </div>
  );
}

export default App;

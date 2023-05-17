import "./App.css";

import { useEffect, useRef } from "react";
import { useNestedScroll, useTestScroll } from "./components/hooks";

function App() {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  const { targetRef, state: globalState } = useTestScroll({});
  const { targetRef: nestedRef, state: nestedState } = useNestedScroll({});

  useEffect(() => {
    if (ref1.current)
      ref1.current.addEventListener("scroll", (e) =>
        console.log(ref1.current?.scrollLeft),
      );
  }, []);

  return (
    <div className="App">
      <div className="progress">
        whole: {globalState.progress} nest: {nestedState.progress}
      </div>
      <div className="parentHorizontal">
        <div className="childHorizontal" ref={ref1}>
          <div className="miniHorizontal" ref={ref2} />
        </div>
      </div>
      <div className="parent" ref={targetRef}>
        parent
        <div className="scrollChild" ref={useNestedScroll.setScrollContainer}>
          <div className="mini" ref={nestedRef}></div>
        </div>
      </div>
    </div>
  );
}

export default App;

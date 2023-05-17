import "./App.css";

import { useEffect, useRef } from "react";
import { useNestedScroll, useTestScroll } from "./components/hooks";

function App() {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  const { targetRef, state: globalState } = useTestScroll({});
  const { targetRef: nestedRef, state: nestedState } = useNestedScroll({});

  return (
    <div className="App">
      <div className="progress">
        whole: {globalState.progress} nest: {nestedState.progress}
      </div>
      <div className="parentHorizontal">
        <div className="childHorizontal">
          <div className="miniHorizontal" />
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

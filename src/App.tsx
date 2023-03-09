import "./App.css";
import Red from "./components/Red";
import Blue from "./components/Blue";
import { useWaffleScrollContainer } from "./hooks/useWaffleScroll";
import { useEffect } from "react";

function App() {
  const { ref } = useWaffleScrollContainer();

  return (
    <div className="App" ref={ref}>
      <Red />
      <Blue />
    </div>
  );
}

export default App;

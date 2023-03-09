import "./App.css";
import Red from "./components/Red";
import Blue from "./components/Blue";
import { useState } from "react";

function App() {
  const [get, set] = useState(false);
  return (
    <div className="App">
      {!get && <Red />}
      <Blue />
      <button
        onClick={() => {
          set(!get);
        }}
      >
        123
      </button>
    </div>
  );
}

export default App;

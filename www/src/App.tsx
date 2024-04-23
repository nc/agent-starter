import { useWS } from "./useRoot";

import "./App.css";

import { Search } from "./Search";

function App() {
  useWS();
  return <Search />;
}

export default App;

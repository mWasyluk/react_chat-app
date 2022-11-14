import './App.css';
import useWindowDimensions from './utils/window-resizer';

function App() {
  const { height, width } = useWindowDimensions();
  const margin = 10;
  return (
    <div className="App" style={{
      margin: margin + "px",
      width: width - 2 * margin,
      height: height - 2 * margin,
    }}>

      <h1 style={{ backgroundColor: "lightblue" }}>OuRoom!</h1>

    </div >
  );
}

export default App;

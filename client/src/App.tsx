import "./App.css";
import TestPage from './pages/Test';
import { Route, Routes } from "react-router-dom"
function App() {
  return (
   <>
  
      <div className="App">
      <Routes>
          <Route path="/" element={<TestPage />} />
        </Routes>
      </div>
    </>
 );
}
export default App

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CryptoList from './components/CryptoList';
import WelcomePage from './components/WelcomePage';
import ChartPage from './components/ChartPage';
import TokenLookup from './components/TokenLookup';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/market" element={<CryptoList />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/token-lookup" element={<TokenLookup />} />
      </Routes>
    </Router>
  );
}

export default App;

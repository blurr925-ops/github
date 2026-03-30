import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/common/BottomNav';
import Home from './pages/Home';
import Patterns from './pages/Patterns';
import MatchCentre from './pages/MatchCentre';
import Goals from './pages/Goals';
import Photos from './pages/Photos';

export default function App() {
  return (
    <>
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patterns" element={<Patterns />} />
          <Route path="/match" element={<MatchCentre />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/photos" element={<Photos />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  );
}

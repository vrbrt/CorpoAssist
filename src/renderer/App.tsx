import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import ReportChunk from './reports/ReportChunk';
import ChunkList from './reports/ChunkList';

const Settings = () => {
  return (
    <div>
      <h1>Settings</h1>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div id="titleBarContainer" className="draggable">
        <div id="titleBar">
          <img id="appIcon" width="24" alt="icon" src={icon} />
          <span id="appTitle">CorpoAssist v0.2.0</span>
        </div>
      </div>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/reportChunk" element={<ReportChunk />} />
        <Route path="/chunkList" element={<ChunkList />} />
      </Routes>
    </Router>
  );
}

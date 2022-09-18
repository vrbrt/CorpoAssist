import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import ReportChunk from './reports/ReportChunk';

const Hello = () => {
  return (
    <div>
      <h1>CorpoAssist v0.1.1</h1>
    </div>
  );
};

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
          <span id="appTitle">CorpoAssist v0.1.1</span>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reportChunk" element={<ReportChunk />} />
      </Routes>
    </Router>
  );
}

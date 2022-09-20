import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import ReportTask from './reports/ReportChunk';
import TasksList from './reports/ChunkList';

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
        <Route path="/tasks/report" element={<ReportTask />} />
        <Route path="/tasks/reports" element={<TasksList />} />
      </Routes>
    </Router>
  );
}

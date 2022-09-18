import { useEffect, useState } from 'react';
import './ChunkList.css';

interface TimeReportRow {
  taskId: number;
  type: string;
  project: string;
  tags: string[];
  date: string;
  time: number;
}

const ChunkList = () => {
  const [chunks, setChunks] = useState<TimeReportRow[]>([]);
  useEffect(() => {
    window.electron.ipcRenderer.once('getReports', (args) =>
      setChunks(args as TimeReportRow[])
    );
    window.electron.ipcRenderer.sendMessage('getReports', []);
  }, []);

  return (
    <div>
      <h1>Hours</h1>
      <div className="scrollWrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Project</th>
              <th>Time in hours</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {chunks.map((row) => (
              <tr key={row.date}>
                <td>{new Date(row.date).toLocaleDateString()}</td>
                <td>{row.type}</td>
                <td>{row.project}</td>
                <td>{row.time}</td>
                <td>{row.tags.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChunkList;

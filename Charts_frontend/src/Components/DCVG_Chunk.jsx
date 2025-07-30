import React, { useContext, useState, useEffect } from 'react';
import { FileContext } from './FileContext';
import { useLocation } from 'react-router-dom';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

const DCVG_Chunks = () => {
  const { fileDataXLI } = useContext(FileContext);
  const query = new URLSearchParams(useLocation().search);
  const chunkSize = parseInt(query.get('chunk') || '500');

  // Allow  user to select the range of threshold values
  const [thresholdMin, setThresholdMin] = useState(0);
  const [thresholdMax, setThresholdMax] = useState(100);
  const [error, setError] = useState('');
  const [chunks, setChunks] = useState([]);

  useEffect(() => {
    // Validate thresholds
    if (thresholdMin < 0 || thresholdMax > 100 || thresholdMin > thresholdMax) {
      setError('Thresholds must be between 0 and 100, and min ≤ max');
      setChunks([]);
      return;
    } else {
      setError('');
    }

    const filtered = fileDataXLI.filter(
      (item) =>
        item['VirtualDistance (m)'] &&
        item['DCVGPercentIR'] &&
        !isNaN(item['VirtualDistance (m)']) &&
        !isNaN(item['DCVGPercentIR']) &&
        Number(item['DCVGPercentIR']) >= thresholdMin &&
        Number(item['DCVGPercentIR']) <= thresholdMax
    );

    const maxDist = Math.max(...filtered.map(row => Number(row['VirtualDistance (m)'])));
    const newChunks = [];

    for (let start = 0; start < maxDist; start += chunkSize) {
      const end = start + chunkSize;
      const chunk = filtered.filter(row =>
        Number(row['VirtualDistance (m)']) >= start &&
        Number(row['VirtualDistance (m)']) < end
      );

      if (chunk.length > 0) {
        const labels = chunk.map(item => Number(item['VirtualDistance (m)']).toFixed(2));
        const dataOn = chunk.map(item => Number(item['DCVGPercentIR']));

        newChunks.push({
          title: `${start}m - ${end}m`,
          data: {
            labels,
            datasets: [
              {
                label: 'DCVGPercentIR (mv)',
                data: dataOn,
                borderColor: '#f542dd',
                backgroundColor: '#f542dd',
                tension: 0.4,
                fill: false,
              },
            ],
          },
        });
      }
    }
    setChunks(newChunks);
  }, [fileDataXLI, thresholdMin, thresholdMax, chunkSize]);

  return (
    <div style = {{padding: '2rem'}}>
      <h2>Section-wise Charts of DCVGPercentIR (mv) for (Every {chunkSize}m)</h2>
      <h3>Extract data for Min and Max Threshold Values</h3>

      <div style={{ marginBottom: '1rem'}}>
        <label>
          Min Threshold:
          <input type="number"
            value={thresholdMin}
            onChange={(e) => setThresholdMin(Number(e.target.value))} style={{ marginLeft: '0.5rem', marginRight: '1rem'}}
          />
        </label>

        <label>
          Max Threshold:
          <input type="number"
            value={thresholdMax}
            onChange={(e) => setThresholdMax(Number(e.target.value))} style={{ marginLeft: '0.5rem', marginRight: '1rem'}}
          />
        </label>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {chunks.map((chunk, i) => (
        <div key={i} style={{ marginBottom: '2rem',
           marginBottom: '2rem',
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              backgroundColor: '#fff'
         }}>
          <h3>{chunk.title}</h3>
          <Line data={chunk.data} options={{ responsive: true, plugins: { legend: { position: 'top' } },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Virtual Distance (m)',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'DCVGPercentIR ',
                },
              },
            },
          }} />
        </div>
      ))}
    </div>
  );
};

export default DCVG_Chunks;

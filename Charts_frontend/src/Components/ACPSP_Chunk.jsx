import React, { useContext, useState,  useEffect } from 'react';
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

//Register Chart Plugins
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

const ACPSP_Chunks = () => {
  const { fileDataXLI } = useContext(FileContext);
  const [localFileData, setLocalFileData] = useState([]);
  const query = new URLSearchParams(useLocation().search);
  const chunkSize = parseInt(query.get('chunk') || '500');
  const [threshold1, setThreshold1] = useState(30);

// Load from localStorage if no context data
  useEffect(() => {
    if (!fileDataXLI || fileDataXLI.length === 0) {
      const storedData = localStorage.getItem('fileDataXLI');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setLocalFileData(parsedData);
        } catch (e) {
          console.error('Failed to parse fileDataXLI from localStorage', e);
        }
      }
    }
  }, [fileDataXLI]);

  const dataToUse = (fileDataXLI && fileDataXLI.length > 0) ? fileDataXLI : localFileData;

  const getKeyInsensitive = (obj, key) => {
    return Object.keys(obj).find(k => k.trim().toLowerCase() === key.toLowerCase());
  };

  if (!dataToUse || dataToUse.length === 0) {
    return <div style={{ padding: '2rem' }}>⚠️ Please upload the XLI file first.</div>;
  }

  // Key Detection
  const distKey = getKeyInsensitive(dataToUse[0], 'VirtualDistance (m)');
  const potKey = getKeyInsensitive(dataToUse[0], 'ACPSP_OnPotential');

  //Filter valid rows
  const filtered = dataToUse.filter(item =>
    item[distKey] !== undefined &&
    item[potKey] !== undefined &&
    !isNaN(item[distKey]) &&
    !isNaN(item[potKey])
  );

  const maxDist = Math.max(...filtered.map(row => Number(row[distKey])));
  const chunks = [];

  for (let start = 0; start < maxDist; start += chunkSize) {
    const end = start + chunkSize;
    const chunk = filtered.filter(row =>
      Number(row[distKey]) >= start && Number(row[distKey]) < end
    );

    if (chunk.length > 0) {
      const labels = chunk.map(item => Number(item[distKey]).toFixed(2));
      const dataOn = chunk.map(item => Number(item[potKey]));

      chunks.push({
        title: `${start}m - ${end}m`,
        data: {
          labels,
          datasets: [
            {
              label: 'ACPSP_OnPotential',
              data: dataOn,
              borderColor: 'orange',
              backgroundColor: 'orange',
              tension: 0.4,
              fill: false,
            },
          ],
        },
      });
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Section-wise Charts of ACPSP_OnPotential (Every {chunkSize}m)</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Threshold:&nbsp;
          <input
            type="number"
            value={threshold1}
            onChange={(e) => setThreshold1(Number(e.target.value))}
          />
        </label>
        &nbsp;&nbsp;
       
      </div>

      <div ref={chartContainerRef}>
        {chunks.map((chunk, i) => (
          <div
            key={i}
            style={{
              marginBottom: '2rem',
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              backgroundColor: '#fff'
            }}
          >
            <h3>{chunk.title}</h3>
            <Line
              data={chunk.data}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  annotation: {
                    annotations: {
                      line1: {
                        type: 'line',
                        yMin: threshold1,
                        yMax: threshold1,
                        borderColor: 'black',
                        borderWidth: 2,
                        label: {
                          display: true,
                          content: `Threshold ${threshold1}`,
                          position: 'start',
                          color: 'red',
                        },
                      },
                    },
                  },
                },
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
                      text: 'ACPSP_OnPotential',
                    },
                  },
                },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ACPSP_Chunks;

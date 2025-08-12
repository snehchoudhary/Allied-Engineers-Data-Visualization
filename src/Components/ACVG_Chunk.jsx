import React, { useContext, useState } from 'react';
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

const ACVG_Chunks = () => {
  const { fileDataXLI } = useContext(FileContext);
  const query = new URLSearchParams(useLocation().search);
  const chunkSize = parseInt(query.get('chunk') || '500');
   const [threshold1, setThreshold1] = useState(30);

  const filtered = fileDataXLI.filter(
    (item) =>
      item['VirtualDistance (m)'] &&
      item['ACVG_VSS_DB'] &&
      !isNaN(item['VirtualDistance (m)']) &&
      !isNaN(item['ACVG_VSS_DB'])
  );

  const maxDist = Math.max(...filtered.map(row => Number(row['VirtualDistance (m)'])));
  const chunks = [];

  for (let start = 0; start < maxDist; start += chunkSize) {
    const end = start + chunkSize;
    const chunk = filtered.filter(row =>
      Number(row['VirtualDistance (m)']) >= start &&
      Number(row['VirtualDistance (m)']) < end
    );

    if (chunk.length > 0) {
      const labels = chunk.map(item => Number(item['VirtualDistance (m)']).toFixed(2));
      const dataOn = chunk.map(item => Number(item['ACVG_VSS_DB']));

      chunks.push({
        title: `${start}m - ${end}m`,
        data: {
          labels,
          datasets: [
            {
              label: 'ACVG_VSS_DB',
              data: dataOn,
              borderColor: 'lightgreen',
              backgroundColor: 'green',
              tension: 0.4,
              fill: false,
            },
          ],
        },
      });
    }
  }

  return (
    <div style = {{padding: '2rem'}}>
      <h2>Section-wise Charts of ACVG_VSS_DB for (Every {chunkSize}m)</h2>


       <div style={{ marginBottom: '1rem' }}>
        <label>
          Threshold:
          <input type="number"
            value={threshold1}
            onChange={(e) => setThreshold1(Number(e.target.value))} />
        </label>
      </div> 

      {chunks.map((chunk, i) => (
        <div key={i} style={{  marginBottom: '2rem',
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              backgroundColor: '#fff' }}>
          <h3>{chunk.title}</h3>
          <Line data={chunk.data} options={{ responsive: true, plugins: { legend: { position: 'top' }, 
        
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
                font: 5,
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
              text: 'ACVG_VSS_DB',
            },
          },
        },
        }} />
        </div>
      ))}
    </div>
  );
};

export default ACVG_Chunks;

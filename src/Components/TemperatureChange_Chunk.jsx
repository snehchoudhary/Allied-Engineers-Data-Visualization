import React, { useContext } from 'react';
import { FileContext } from './FileContext';
import { useLocation } from 'react-router-dom';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TemperatureChange_Chunks = () => {
  const { fileDataICE } = useContext(FileContext);
  const query = new URLSearchParams(useLocation().search);
  const chunkSize = parseInt(query.get('chunk') || '500');

  const filtered = fileDataICE.filter(
    (item) =>
      item['Chainage (m)'] &&
      item['Elevation (m)'] &&
      item['Temperature change']&&
      !isNaN(item['Chainage (m)']) &&
      !isNaN(item['Elevation (m)'])&&
      !isNaN(item['Temperature change'])
  );

  const maxDist = Math.max(...filtered.map(row => Number(row['Chainage (m)'])));
  const chunks = [];

  for (let start = 0; start < maxDist; start += chunkSize) {
    const end = start + chunkSize;
    const chunk = filtered.filter(row =>
      Number(row['Chainage (m)']) >= start &&
      Number(row['Chainage (m)']) < end
    );

    if (chunk.length > 0) {
      const labels = chunk.map(item => Number(item['Chainage (m)']).toFixed(2));
      const dataOn = chunk.map(item => Number(item['Elevation (m)']));
      const dataOff = chunk.map(item => Number(item['Temperature change']));

      chunks.push({
        title: `${start}m - ${end}m`,
        data: {
          labels,
          datasets: [
            {
              label: 'Elevation (m)',
              data: dataOn,
              borderColor: 'rgba(1, 6, 6, 1)',
              backgroundColor: 'rgba(1, 6, 6, 1)',
              tension: 0.4,
              fill: false,
              yAxisID: 'y',  //Primary Y-Axis
              pointRadius:0,
            },
             {
              label: 'Temperature Change',
              data: dataOff,
              borderColor: '#FF8C00',
              backgroundColor: '#FF8C00',
              tension: 0.4,
              fill: false,
              yAxisID: 'y1',  //Primary Y-Axis
              pointRadius:0,
            },
          ],
        },
        options: {
          responsive: true,
          plugin: {
            legend:{
              position: 'top',
            },
            title: {
              display: true,
              text: `Elevation & Temperature Change vs Chainage (${start}m - ${end}m)`
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Chainage (m)',
              },
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Elevation (m)',
              },
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Temperature Change (°C)',
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          },
        },
      });
    }
  }

  return (
    <div style={{padding : '2rem'}}>
      <h2>Section-wise Charts of Temperature Drop for (Every {chunkSize}m)</h2>
      {chunks.map((chunk, i) => (
        <div key={i} style={{ marginBottom: '2rem',
           
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              backgroundColor: '#fff'
         }}>
          <h3>{chunk.title}</h3>
          <Line data={chunk.data} options={chunk.options} />
        </div>
      ))}
    </div>
  );
};

export default TemperatureChange_Chunks;

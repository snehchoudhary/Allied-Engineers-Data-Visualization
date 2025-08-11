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

const FlowRegime_Chunks = () => {
  const { fileDataICE } = useContext(FileContext);
  const query = new URLSearchParams(useLocation().search);
  const chunkSize = parseInt(query.get('chunk') || '500');

  // Log keys of first row to check actual keys
  if (fileDataICE.length > 0) {
    console.log('Keys in first row of fileDataICE:', Object.keys(fileDataICE[0]));
  }

  // Log unique FLOW REGIME values to check data type
  const flowRegimeValuesRaw = [...new Set(fileDataICE.map(item => item['FLOW REGIME ']))];
  console.log('Unique FLOW REGIME values:', flowRegimeValuesRaw);

  // Relax filter for FLOW REGIME to allow non-numeric values
  const filtered = fileDataICE.filter(
    (item) =>
      item['Chainage (m)'] &&
      item['Elevation (m)'] &&
      item['FLOW REGIME '] !== undefined &&
      !isNaN(item['Chainage (m)']) &&
      !isNaN(item['Elevation (m)'])
  );

  console.log('Filtered FlowRegime data length:', filtered.length);

  const maxDist = Math.max(...filtered.map(row => Number(row['Chainage (m)'])));
  const chunks = [];

  for (let start = 0; start < maxDist; start += chunkSize) {
    const end = start + chunkSize;
    const chunk = filtered.filter(row =>
      Number(row['Chainage (m)']) >= start &&
      Number(row['Chainage (m)']) < end
    );

    console.log(`Chunk from ${start} to ${end} length:`, chunk.length);

    if (chunk.length > 0) {
      const labels = chunk.map(item => Number(item['Chainage (m)']).toFixed(2));
      const dataOn = chunk.map(item => Number(item['Elevation (m)']));
      // Map FLOW REGIME string values to numeric values for charting
      const flowRegimeMap = {
        '3': 3,
        '2': 2,
        '': 0,
      };
      const dataOff = chunk.map(item => flowRegimeMap[item['FLOW REGIME ']] ?? 0);

      chunks.push({
        title: `${start}m - ${end}m`,
        data: {
          datasets: [
            {
              label: 'Elevation (m)',
              data: dataOn.map((y, i) => ({ x: Number(chunk[i]['Chainage (m)']), y })),
              borderColor: 'rgba(1, 6, 6, 1)',
              backgroundColor: 'rgba(1, 6, 6, 1)',
              tension: 0.4,
              fill: false,
              yAxisID: 'y',  //Primary Y-Axis
              pointRadius:0,
            },
            {
              label: 'FLOW REGIME',
              data: dataOff.map((y, i) => ({ x: Number(chunk[i]['Chainage (m)']), y })),
              borderColor: '#FF00FF',
              backgroundColor: '#FF00FF',
              tension: 0.4,
              fill: false,
              yAxisID: 'y1', //Secondary Y-Axis
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend:{
              position: 'top',
            },
            title: {
              display: true,
              text: `Elevation & Flow Regime vs Chainage (${start}m - ${end}m)`
            },
          },
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
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
                text: 'Flow Regime Figures',
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
      <h2>Section-wise Charts of Flow Regime for (Every {chunkSize}m)</h2>
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

export default FlowRegime_Chunks;

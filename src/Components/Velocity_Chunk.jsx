import React, { useContext, useEffect } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, PointElement,LineElement, Title, Tooltip, Legend);

const Velocity_Chunk = () => {
  const { fileDataICE } = useContext(FileContext);
  const query = new URLSearchParams(useLocation().search);
  let chunkSize = parseInt(query.get('chunk'), 10);

  if (isNaN(chunkSize) || chunkSize <= 0) {
    chunkSize = 500; // default chunk size
  }

  // Trim keys of each row to ensure consistent keys
  const trimmedData = fileDataICE.map(row => {
    const newRow = {};
    Object.keys(row).forEach(key => {
      newRow[key.trim()] = row[key];
    });
    return newRow;
  });

  // Relaxed filtering: only require essential keys and numeric values
  const filtered = trimmedData.filter(item =>
    item['Chainage (m)'] !== undefined &&
    !isNaN(Number(item['Chainage (m)'])) &&
    item['Elevation (m)'] !== undefined &&
    !isNaN(Number(item['Elevation (m)'])) 
    // item['AC Current Density (A/m2)'] !== undefined &&
    // !isNaN(Number(item['AC Current Density (A/m2)']))
  );

  useEffect(() => {
    // console.log('Chunk size:', chunkSize);
    // console.log('Filtered data length:', filtered.length);
  }, [chunkSize, filtered.length]);

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
      const data1 = chunk.map(item => Number(item['Elevation (m)']));
      const data2 = chunk.map(item => Number(item['Superficial Gas Velocity (ft/s)']));
      const data3 = chunk.map(item => Number(item['Mixture Velocity (ft/s)'] || 0));
      const data4 = chunk.map(item => Number(item['Superficial Liquid Velocity  (Hydrocarbon) (ft/s)'] || 0));
      const data5 = chunk.map(item => Number(item['Superficial Water Velocity (ft/s)'] || 0));
     
      chunks.push({
        title: `${start}m - ${end}m`,
        data: {
          datasets: [
            {
              label: 'Elevation (m)',
              data: data1.map((y, i) => ({ x: Number(chunk[i]['Chainage (m)']), y })),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgb(75, 192, 192)',
              tension: 0.4,
              fill: false,
              yAxisID: 'y',  //Primary Y-Axis
            },
            {
              label: 'Superficial Gas Velocity (ft/s)',
              data: data2.map((y, i) => ({ x: Number(chunk[i]['Chainage (m)']), y })),
              borderColor: 'green',
              backgroundColor: 'green',
              tension: 0.4,
              fill: false,
              yAxisID: 'y1',  //Secondary Y-Axis
            },
            {
              label: 'Mixture Velocity (ft/s)',
              data: data3.map((y, i) => ({ x: Number(chunk[i]['Chainage (m)']), y })),
              borderColor: '#00008B',
              backgroundColor: '#00008B',
              tension: 0.4,
              fill: false,
              yAxisID: 'y1',  //Secondary Y-Axis
            },
            {
              label: 'Superficial Liquid Velocity (Hydrocarbon) (ft/s)',
              data: data4.map((y, i) => ({ x: Number(chunk[i]['Chainage (m)']), y })),
              borderColor: '#00008B',
              backgroundColor: '#00008B',
              tension: 0.4,
              fill: false,
              yAxisID: 'y1',  //Secondary Y-Axis
            },
            {
              label: 'Superficial Water Velocity (ft/s)',
              data: data5.map((y, i) => ({ x: Number(chunk[i]['Chainage (m)']), y })),
              borderColor: '#00008B',
              backgroundColor: '#00008B',
              tension: 0.4,
              fill: false,
              yAxisID: 'y1',  //Secondary Y-Axis
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: `Velocities vs Chainage (${start}m - ${end}m)`,
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
                text: 'Superficial Velocity (ft/s)',
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
    <div style={{ padding: '2rem' }}>
      <h2>Section-wise Charts of Velocity Profile for (Every {chunkSize}m)</h2>
      {chunks.length === 0 && <p>No data available for the selected chunk size.</p>}
      {chunks.map((chunk, i) => (
        <div
          key={i}
          style={{
            marginBottom: '2rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
          }}
        >
          <h3>{chunk.title}</h3>
          <Line data={chunk.data} options={chunk.options} />
        </div>
      ))}
    </div>
  );
};

export default Velocity_Chunk;

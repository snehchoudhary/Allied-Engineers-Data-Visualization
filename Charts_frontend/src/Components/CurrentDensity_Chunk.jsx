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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CurrentDensity_Chunk = () => {
  const { fileDataXLI } = useContext(FileContext);
  const query = new URLSearchParams(useLocation().search);
  let chunkSize = parseInt(query.get('chunk'), 10);

  if (isNaN(chunkSize) || chunkSize <= 0) {
    chunkSize = 500; // default chunk size
  }

  // Trim keys of each row to ensure consistent keys
  const trimmedData = fileDataXLI.map(row => {
    const newRow = {};
    Object.keys(row).forEach(key => {
      newRow[key.trim()] = row[key];
    });
    return newRow;
  });

  // Relaxed filtering: only require essential keys and numeric values
  const filtered = trimmedData.filter(item =>
    item['XLI Chainage (m)'] !== undefined &&
    !isNaN(Number(item['XLI Chainage (m)'])) &&
    item['Soil Resistivity (Ohm-m)'] !== undefined &&
    !isNaN(Number(item['Soil Resistivity (Ohm-m)'])) &&
    item['AC Current Density (A/m2)'] !== undefined &&
    !isNaN(Number(item['AC Current Density (A/m2)']))
  );

  useEffect(() => {
    console.log('Chunk size:', chunkSize);
    console.log('Filtered data length:', filtered.length);
  }, [chunkSize, filtered.length]);

  const maxDist = Math.max(...filtered.map(row => Number(row['XLI Chainage (m)'])));
  const chunks = [];

  for (let start = 0; start < maxDist; start += chunkSize) {
    const end = start + chunkSize;
    const chunk = filtered.filter(row =>
      Number(row['XLI Chainage (m)']) >= start &&
      Number(row['XLI Chainage (m)']) < end
    );

    if (chunk.length > 0) {
      const labels = chunk.map(item => Number(item['XLI Chainage (m)']).toFixed(2));
      const data1 = chunk.map(item => Number(item['Soil Resistivity (Ohm-m)']));
      const data2 = chunk.map(item => Number(item['AC Current Density (A/m2)']));
      const data3 = chunk.map(item => Number(item['ACPSP (V)*10'] || 0));
      const data4 = chunk.map(item => Number(item['LT Line'] || 0));
      const data5 = chunk.map(item => Number(item['AC Interference'] || 0));
      const data6 = chunk.map(item => Number(item['Paved Road/Surface pavement'] || 0));
      const data7 = chunk.map(item => Number(item['Actual Dig sites'] || 0));
      const data8 = chunk.map(item => Number(item['Threshold AC Current Density (A/m2)'] || 0));

      chunks.push({
        title: `${start}m - ${end}m`,
        data: {
          labels,
          datasets: [
            {
              label: 'Soil Resistivity (Ohm-m)',
              data: data1,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgb(75, 192, 192)',
              tension: 0.4,
              fill: false,
              yAxisID: 'y',  //Primary Y-Axis
            },
            {
              label: 'LT Line',
              data: data4,
              borderColor: 'green',
              backgroundColor: 'green',
              tension: 0.4,
              fill: false,
              yAxisID: 'y',  //Primary Y-Axis
            },
            {
              label: 'AC Interference',
              data: data5,
              borderColor: '#00008B',
              backgroundColor: '#00008B',
              tension: 0.4,
              fill: false,
              yAxisID: 'y',  //Primary Y-Axis
            },
            {
              label: 'Paved Road/Surface pavement',
              data: data6,
              borderColor: '#00008B',
              backgroundColor: '#00008B',
              tension: 0.4,
              fill: false,
              yAxisID: 'y',  //Primary Y-Axis
            },
            {
              label: 'AC Current Density (A/m2)',
              data: data2,
              borderColor: 'brown',
              backgroundColor: 'brown',
              tension: 0.4,
              fill: false,
              yAxisID: 'y1', //Secondary Y-Axis
            },
            {
              label: 'ACPSP (V)*10',
              data: data3,
              borderColor: 'lightgreen',
              backgroundColor: 'lightgreen',
              tension: 0.4,
              fill: false,
              yAxisID: 'y1', //Secondary Y-Axis
            },
            {
              label: 'Actual Dig sites',
              data: data7,
              borderColor: 'darkgreen',
              backgroundColor: 'darkgreen',
              tension: 0.4,
              fill: false,
              yAxisID: 'y1', //Secondary Y-Axis
            },
            {
              label: 'Threshold AC Current Density (A/m2)',
              data: data8,
              borderColor: '#fc03f8',
              backgroundColor: '#fc03f8',
              tension: 0.4,
              fill: false,
              yAxisID: 'y1', //Secondary Y-Axis
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
              text: `Soil Resistivity & AC-Current Density/ACPSP vs Chainage (${start}m - ${end}m)`,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'XLI Chainage (m)',
              },
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Soil Resistivity (Ohm-m)',
              },
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'AC Current Density (A/m2)',
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
      <h2>Section-wise Charts of AC Current Density for (Every {chunkSize}m)</h2>
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

export default CurrentDensity_Chunk;

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

const CR_Chunk = () => {
  const { fileDataICE } = useContext(FileContext);
  const query = new URLSearchParams(useLocation().search);
  const chunkSize = parseInt(query.get('chunk') || '500');

  const filtered = fileDataICE.filter(
    (item) =>
      item['Chainage (m)'] &&
      item['Corrosion Rate (Worse Case) (mm/y)'] &&
      item['Corrosion Rate - Realistic (mmpy)']&&
      item['Corrosion Rate (General) (mm/y)']&&
      item['Elevation (m)']&&
      item['Corrosion Rate & MIC (mm/y)']&&
      item['Corrosion Rate & O2 (mm/y)']&&
      !isNaN(item['Chainage (m)']) &&
      !isNaN(item['Corrosion Rate (Worse Case) (mm/y)'])&&
      !isNaN(item['Corrosion Rate - Realistic (mmpy)'])&&
      !isNaN(item ['Elevation (m)'])&&
      !isNaN(item['Corrosion Rate (General) (mm/y)'])&&
      !isNaN(item['Corrosion Rate & MIC (mm/y)'])&&
      !isNaN(item['Corrosion Rate & O2 (mm/y)'])
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
      const dataOn = chunk.map(item => Number(item['Corrosion Rate (Worse Case) (mm/y)']));
      const dataOff = chunk.map(item => Number(item['Corrosion Rate - Realistic (mmpy)']));
      const elevationValues = chunk.map(item => Number(item['Elevation (m)']));
      const generalValue = chunk.map(item => Number(item['Corrosion Rate (General) (mm/y)']));
      const micValue = chunk.map(item => Number(item['Corrosion Rate & MIC (mm/y)']));
      const O2Value = chunk.map(item => Number(item['Corrosion Rate & O2 (mm/y)']));

      chunks.push({
        title: `${start}m - ${end}m`,
        data: {
          labels,
          datasets: [
            {
              label: 'Corrosion Rate (Worse Case) (mm/y)',
              data: dataOn,
              borderColor: 'lightgreen',
              backgroundColor: 'green',
              tension: 0.4,
              fill: false,
               pointRadius: 4,
        borderWidth: 0,
        showLine: false,
            },
             {
              label: 'Corrosion Rate - Realistic (mmpy)',
              data: dataOff,
              borderColor: 'yellow',
              backgroundColor: 'yellow',
              tension: 0.4,
              fill: false,
               pointRadius: 4,
        borderWidth: 0,
        showLine: false,
            },
             {
        label: `Elevation (m)`,
        data: elevationValues,
        fill: false,
        borderColor: 'black',
        backgroundColor: 'black',
        tension: 0.4,
        yAxisID: 'y1',
        pointRadius: 0,
      },
      {
              label: 'Corrosion Rate - General (mmpy)',
              data: generalValue,
              borderColor: '#000080',
              backgroundColor: '#000080',
              tension: 0.4,
              fill: false,
               pointRadius: 4,
        borderWidth: 0,
        showLine: false,
            },
            {
              label: 'Corrosion Rate & MIC (mm/y)',
              data: micValue,
              borderColor: 'brown',
              backgroundColor: 'brown',
              tension: 0.4,
              fill: false,
               pointRadius: 4,
        borderWidth: 0,
        showLine: false,
            },
             {
              label: 'Corrosion Rate & O2 (mm/y)',
              data: O2Value,
              borderColor: '#FF00FF',
              backgroundColor: '#FF00FF',
              tension: 0.4,
              fill: false,
               pointRadius: 4,
        borderWidth: 0,
        showLine: false,
            },
          ],
        },
      });
    }
  }

  return (
    <div style = {{padding: '2rem'}}>
      <h2>Section-wise Charts of Corrosion Rate (Worst + Realistic) for (Every {chunkSize}m)</h2>
      {chunks.map((chunk, i) => (
        <div key={i} style={{ marginBottom: '2rem' ,
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
              text: 'Chainage (m)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Corrosion Rate (Worst+Realistic)'
            }
          },
          y1: {
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Elevation (m)', 
        },
        grid: {
          drawOnChartArea: false,  //avoids overlaps of grid lines
        },
      
      },
        }
        }} />
        </div>
      ))}
    </div>
  );
};

export default CR_Chunk;

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

const WallLoss_Chunk = () => {
  const { fileDataICE } = useContext(FileContext);
  const query = new URLSearchParams(useLocation().search);
  const chunkSize = parseInt(query.get('chunk') || '500');

  const getKeyInsensitive = (obj, key) => {
    // Match key ignoring case and optional suffix like _1, _2 etc.
    const regex = new RegExp(`^${key.toLowerCase().replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}(?:_\\d+)?$`);
    return Object.keys(obj).find(k => regex.test(k.trim().toLowerCase()));
  };

  const getKeyByKeywords = (obj, keywords) => {
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    return Object.keys(obj).find(k => {
      const lowerKey = k.toLowerCase();
      return lowerKeywords.every(kw => lowerKey.includes(kw));
    });
  };

  if (!fileDataICE || fileDataICE.length === 0) {
    return <div style={{ padding: '2rem' }}>⚠️ Please upload the ICE file first.</div>;
  }

  console.log('Available keys in ICE file:', Object.keys(fileDataICE[0]));

  // Adjust keys to match available columns with spaces trimmed and suffixes handled
  const distKey = getKeyInsensitive(fileDataICE[0], 'Chainage (m)');
  const worstKey = getKeyByKeywords(fileDataICE[0], ['wall loss', 'worst']);
  const realisticKey = getKeyByKeywords(fileDataICE[0], ['wall loss', 'realistic']);
  const elevationKey = getKeyInsensitive(fileDataICE[0], 'Elevation (m)');

  if (!distKey || !worstKey || !realisticKey || !elevationKey) {
    return (
      <div style={{ padding: '2rem' }}>
        ⚠️ Required columns not found in ICE file data. Available columns: {Object.keys(fileDataICE[0]).join(', ')}
      </div>
    );
  }

  const filtered = fileDataICE.filter(
    (item) =>
      item[distKey] !== undefined &&
      item[worstKey] !== undefined &&
      item[realisticKey] !== undefined &&
      item[elevationKey] !== undefined &&
      !isNaN(item[distKey]) &&
      !isNaN(item[worstKey]) &&
      !isNaN(item[realisticKey]) &&
      !isNaN(item[elevationKey])
  );

  const maxDist = Math.max(...filtered.map(row => Number(row[distKey])));
  const chunks = [];

  for (let start = 0; start < maxDist; start += chunkSize) {
    const end = start + chunkSize;
    const chunk = filtered.filter(row =>
      Number(row[distKey]) >= start &&
      Number(row[distKey]) < end
    );

    if (chunk.length > 0) {
      const labels = chunk.map(item => Number(item[distKey]).toFixed(2));
      const dataOn = chunk.map(item => Number(item[worstKey]));
      const dataOff = chunk.map(item => Number(item[realisticKey]));
      const elevationValues = chunk.map(item => Number(item[elevationKey]));

      chunks.push({
        title: `${start}m - ${end}m`,
        data: {
          labels,
          datasets: [
            {
              label: '%Wall Loss - Worst',
              data: dataOn,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgb(75, 192, 192)',
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              borderWidth: 0,
              showLine: false,
            },
            {
              label: '%Wall Loss - Realistic',
              data: dataOff,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 1)',
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
          ],
        },
      });
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Section-wise Charts of %Wall-Loss (Worst + Realistic) for (Every {chunkSize}m)</h2>
      {chunks.map((chunk, i) => (
        <div key={i} style={{
          marginBottom: '2rem',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          backgroundColor: '#fff'
        }}>
          <h3>{chunk.title}</h3>

          <Line data={chunk.data} options={{
            responsive: true,
            plugins: { legend: { position: 'top' } },
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
                  text: '%Wall Loss (Worst + Realistic)',
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
                  drawOnChartArea: false,
                },
              },
            }
          }} />
        </div>
      ))}
    </div>
  );
};

export default WallLoss_Chunk;

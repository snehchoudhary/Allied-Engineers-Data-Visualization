import React, { useContext } from 'react';
import { FileContext } from './FileContext';
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
import annotationPlugin from 'chartjs-plugin-annotation';

// Register Chart.js plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const WallLoss = () => {
  const { fileDataICE } = useContext(FileContext);

  const xKey = 'Chainage (m)';
  const yKey1 = '%Wall Loss - Worst';
  const yKey2Raw = '%Wall Loss -  Realistic'; // With extra space — will auto-match
  const yKey3 = 'Elevation (m)';

  // Step 1: Clean and trim headers
  const cleanData = fileDataICE.map(row => {
    const cleaned = {};
    Object.keys(row).forEach(key => {
      cleaned[key.trim()] = row[key];
    });
    return cleaned;
  });

  // Step 2: Handle dynamic header if duplicated/renamed
  const availableKeys = Object.keys(cleanData[0] || {});
  const yKey2 = availableKeys.find(k => k.trim().startsWith(yKey2Raw.trim()));
  const elevationValues = cleanData.map((row) => row[yKey3]);

  if (!yKey2) {
    console.warn(`Column "${yKey2Raw}" not found. Found keys:`, availableKeys);
    return <p style={{ color: 'red' }}>Missing column: {yKey2Raw}</p>;
  }

  // Step 3: Parse values safely, strip '%' and convert to numbers
  const parsePercent = (value) =>
    typeof value === 'string' ? parseFloat(value.replace('%', '').trim()) : value;

  const labels = cleanData.map((row) => row[xKey]);
  const worstValues = cleanData.map((row) => parsePercent(row[yKey1]));
  const realisticValues = cleanData.map((row) => parsePercent(row[yKey2]));

  // Optional: check sample data
  // console.log('Worst Wall Loss:', worstValues.slice(0, 5));
  // console.log('Realistic Wall Loss:', realisticValues.slice(0, 5));

  // Step 4: Chart Data
  const chartData = {
    labels,
    datasets: [
      {
        label: `${yKey1} vs ${xKey}`,
        data: worstValues,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgb(75, 192, 192)',
         pointRadius: 4,
        borderWidth: 0,
        showLine: false,
        tension: 0.4,
      },
      {
        label: `${yKey2} vs ${xKey}`,
        data: realisticValues,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)', // Better visibility than 'lightpink'
        backgroundColor: 'rgba(255, 99, 132, 1)',
         pointRadius: 4,
        borderWidth: 0,
        showLine: false,
        tension: 0.4,
      },
      {
        label: `${yKey3} vs ${xKey}`,
        data: elevationValues,
        fill: false,
        borderColor: 'black', // Better visibility than 'lightpink'
        backgroundColor: 'black',
        tension: 0.4,
        yAxisID: 'y1',
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '% Wall Loss - Worst & Realistic vs Chainage',
      },
      legend: {
        display: true,
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
        title: {
          display: true,
          text: '%Wall Loss (Worst+Realistic)'
        }
      },
        y1: {
        // type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Elevation (m)', //HL
        },
        grid: {
          drawOnChartArea: false,  //avoids overlaps of grid lines
        },
      },
    }
  };

  return(

    <div style = {{ maxWidth: '100%',
      margin: '21px auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>

      <h2>%Wall Loss (Worst + Realistic)</h2>
     {fileDataICE.length > 0 ? (
    <Line data={chartData} options={options} />
  ) : (
    <p>Upload a file to view the chart.</p>
  )}

   {/* Button to show chunks */}

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button style={{fontSize: '18px', cursor: 'pointer'}} onClick={() => {
          const input = prompt('Enter chunk size in meters: ');
          if (input && !isNaN(input)) {
            window.open(`/loss-chunks?chunk=${input}`, '_blank');
          }
        }}>
          Show Section-wise Charts
        </button>
      </div>
  </div>
);
};

export default WallLoss;

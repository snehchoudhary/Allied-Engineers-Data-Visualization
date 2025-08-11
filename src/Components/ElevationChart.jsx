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
import {useNavigate} from 'react-router-dom';


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

const ElevationChart = () => {
  const { fileDataICE } = useContext(FileContext);
  const navigate = useNavigate();

  console.log('ElevationChart fileDataICE:', fileDataICE);

  const xKey = 'Chainage (m)';
  const yKey1 = 'Elevation (m)';
  const yKey2 = 'Water Holdup (ABBL)';

  // Clean and trim column headers (just in case)
  let cleanData = fileDataICE.map(row => {
    const cleaned = {};
    Object.keys(row).forEach(key => {
      cleaned[key.trim()] = row[key];
    });
    return cleaned;
  });

  // Sort cleanData by Chainage (m) numerically ascending
  cleanData = cleanData.sort((a, b) => Number(a[xKey]) - Number(b[xKey]));

  const elevationValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey1]) }));
  const hlValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey2]) }));

  const chartData = {
    datasets: [
      {
        label: `${yKey1} `,
        data: elevationValues,
        fill: false,
        borderColor: 'rgba(1, 6, 6, 1)',
        backgroundColor: 'rgba(1, 6, 6, 1)',
        tension: 0.4,
        yAxisID: 'y', //Primary Axis
        pointRadius: 0,
      },

      {
        label: `${yKey2} `,
        data: hlValues,
        fill: false,
        borderColor: '#FF00FF',
        backgroundColor: '#FF00FF',
        tension: 0.4,
        yAxisID: 'y1', //Secondary Axis
        pointRadius: 4,
        borderWidth: 0,
        showLine: false,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    mainAspectRation: false,
    plugins: {
      title: {
        display: true,
        text: `Elevation & HL vs Chainage`,
      },
      legend: {
        display: true,
      },
    },

    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: xKey,
        },
      },
      y: {
        display: true,
        position: 'left',
        title: {
          display: true,
          text: yKey1,  //Elevation
        },
      },

      y1: {
        display: true,
        position: 'right',
        title: {
          display: true,
          text: yKey2, //HL
        },
        grid: {
          drawOnChartArea: false,  //avoids overlaps of grid lines
        },
      },
    },
  };

  return (
    <div style = {{ maxWidth: '100%',
      margin: '21px auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <h2>Liquid Hold-Up</h2>
      {fileDataICE.length > 0 ? <Line data={chartData} options={options} /> :null}

       {/* Button to show chunks */}

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button style={{fontSize: '18px', cursor: 'pointer'}} onClick={() => {
          const input = prompt('Enter chunk size in meters: ');
          if (input && !isNaN(input)) {
            window.open(`/rolledUp-chunks?chunk=${input}`, '_blank');
          }
        }}>
          Show Section-wise Charts
        </button>
      </div>
  </div>
  );
};

export default ElevationChart;

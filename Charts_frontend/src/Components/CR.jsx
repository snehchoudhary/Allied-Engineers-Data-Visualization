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

const CorrosionRate = () => {
  const { fileDataICE } = useContext(FileContext);
   const navigate = useNavigate();

  const xKey = 'Chainage (m)';
  const yKey1 = 'Sce-1 CCR - Worst mmpy';
  const yKey2 = 'Sce-1 CCR - Realistic mmpy';
  const yKey3 = 'Elevation (m)'

  // Clean and trim column headers (just in case)
  const cleanData = fileDataICE.map(row => {
    const cleaned = {};
    Object.keys(row).forEach(key => {
      cleaned[key.trim()] = row[key];
    });
    return cleaned;
  });

  const labels = cleanData.map((row) => row[xKey]);
  const worstValues = cleanData.map((row) => row[yKey1]);
  const RealisticValues = cleanData.map((row) => row[yKey2]);
  const elevationValues = cleanData.map((row) => row[yKey3]);

  const chartData = {
    labels,
    datasets: [
      
      {
        label: `${yKey1} vs ${xKey}`,
        data: worstValues,
        fill: false,
        borderColor: 'green',
        backgroundColor: 'green',
         pointRadius: 4,
        borderWidth: 0,
        showLine: false,
        tension: 0.4,
        
      },

       {
        label: `${yKey2} vs ${xKey}`,
        data: RealisticValues,
        fill: false,
        borderColor: 'yellow',
        backgroundColor: 'yellow',
        tension: 0.4,
         pointRadius: 4,
        borderWidth: 0,
        showLine: false,
      },
       {
        label: `${yKey3} vs ${xKey}`,
        data: elevationValues,
        fill: false,
        borderColor: 'black',
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
        text: `Elevation & Corrosion Rate - Worst and Realistic`,
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
          text: 'Corrosion Rate (Worst+Realistic)',
        },
      },
      y1: {
        display: true,
        position: 'right',
        title: {
          display: true,
          text: yKey3, //HL
        },
        grid: {
          drawOnChartArea: false,  //avoids overlaps of grid lines
        },
      },
    },
  };

  return(
    <div style = {{ maxWidth: '100%',
      margin: '21px auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>

      <h2>Chart Of Corrosion Rate (Worst + Realistic)</h2>
     {fileDataICE.length > 0 ? <Line data={chartData} options={options} /> : null}

      {/* Button to show chunks */}

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button style={{fontSize: '18px', cursor: 'pointer'}} onClick={() => {
          const input = prompt('Enter chunk size in meters: ');
          if (input && !isNaN(input)) {
            window.open(`/cr-chunks?chunk=${input}`, '_blank');
          }
        }}>
          Show Section-wise Charts
        </button>
      </div>
     </div>
  );
};

export default CorrosionRate;

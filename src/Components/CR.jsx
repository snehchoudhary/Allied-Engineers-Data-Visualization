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

//Register chart.js components and plugins

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

  //get parsed XLI file data from file context
  const { fileDataICE } = useContext(FileContext);
   const navigate = useNavigate();

   //Data for chart
  const xKey = 'Chainage (m)';
  const yKey1 = 'Corrosion Rate (Worse Case) (mm/y)';
  const yKey2 = 'Corrosion Rate - Realistic (mmpy)';
  const yKey3 = 'Elevation (m)';
  const yKey4 = 'Corrosion Rate (General) (mm/y)';
  const yKey5 = 'Corrosion Rate & MIC (mm/y)';
  const yKey6 = 'Corrosion Rate & O2 (mm/y)';

  // Clean and trim column headers (just in case)
  const cleanData = fileDataICE.map(row => {
    const cleaned = {};
    Object.keys(row).forEach(key => {
      cleaned[key.trim()] = row[key];
    });
    return cleaned;
  });

  // Extract chart data based on specified keys 
  const worstValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey1]) }));
  const RealisticValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey2]) }));
  const elevationValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey3]) }));
  const generalValue =  cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey4]) }));
  const MICValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey5]) }));
  const O2Values = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey6]) }));

  //set chart data 
  const chartData = {
    datasets: [
      {
        label: `${yKey1}`,
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
        label: `${yKey2}`,
        data: RealisticValues,
        fill: false,
        borderColor: '#FFA500',
        backgroundColor: '#FFA500',
        tension: 0.4,
        pointRadius: 4,
        borderWidth: 0,
        showLine: false,
      },
      {
        label: `${yKey3}`,
        data: elevationValues,
        fill: false,
        borderColor: 'black',
        backgroundColor: 'black',
        tension: 0.4,
        yAxisID: 'y1',
        pointRadius: 0,
      },
     {
        label: `${yKey4}`,
        data: generalValue,
        fill: false,
        borderColor: '#000080',
        backgroundColor: '#000080',
        tension: 0.4,
        pointRadius: 4,
        borderWidth: 0,
        showLine: false,
      },
      {
        label: `${yKey5}`,
        data: MICValues,
        fill: false,
        borderColor: 'brown',
        backgroundColor: 'brown',
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 4,
         borderWidth: 0,
        showLine: false,
      },
      {
        label: `${yKey6}`,
        data: O2Values,
        fill: false,
        borderColor: '#FF00FF',
        backgroundColor: '#FF00FF',
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 4,
          borderWidth: 0,
        showLine: false,
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

      // X-Axis
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Chainage (m)',
        },
      },
      // Primary Axis
      y: {
        title: {
          display: true,
          text: 'Corrosion Rate (Worst+Realistic)',
        },
      },
      // Secondary Axis
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

      <h2>Corrosion Rate</h2>
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

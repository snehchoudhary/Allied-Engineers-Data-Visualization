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

const VelocityChart = () => {
  const { fileDataICE } = useContext(FileContext);
  const navigate = useNavigate();

  //console.log('CurrentDensityChart fileDataICE:', fileDataICE);

  const xKey = 'Chainage (m)';
  const yKey1 = 'Elevation (m)';
  const yKey2 = 'Superficial Gas Velocity (ft/s)';
  const yKey3 = 'Mixture Velocity (ft/s)'
  const yKey4 = 'Superficial Liquid Velocity (Hydrocarbon) (ft/s)'
  const yKey5 = 'Superficial Water Velocity (ft/s)'
  

  // Clean and trim column headers (just in case)
  const cleanData = fileDataICE.map(row => {
    const cleaned = {};
    Object.keys(row).forEach(key => {
      cleaned[key.trim()] = row[key];
    });
    return cleaned;
  });

  const elevationValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey1]) }));
  const superficialGasVelocityValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey2]) }));
  const mixtureVelocityValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey3]) }));
  const superficialLiquidVelocityValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey4]) }));
  const superficialWaterVelocityValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey5]) }));

  const chartData = {
    datasets: [
      {
        label: `${yKey1}`,
        data: elevationValues,
        fill: false,
        borderColor: 'rgba(1, 6, 6, 1)',
        backgroundColor: 'rgba(1, 6, 6, 1)',
        tension: 0.4,
        yAxisID: 'y', //Primary Axis
        pointRadius: 0,
      },

      {
        label: `${yKey2}`,
        data: superficialGasVelocityValues,
        fill: false,
        borderColor: 'green',
        backgroundColor: 'green',
        // pointStyle: 'cross',
        tension: 0.4,
        yAxisID: 'y1', //Secondary Axis
         pointRadius: 4,
        borderWidth: 0,
        showLine: false,
        pointHoverRadius: 5,
      },

      {
        label: `${yKey3}`,
        data: mixtureVelocityValues,
        fill: false,
        borderColor: '#00008B',
        backgroundColor: '#00008B',
        pointStyle: 'crossRot',
        tension: 0.4,
        yAxisID: 'y1', //Secondary Axis
      },

      {
        label: `${yKey4}`,
        data: superficialLiquidVelocityValues,
        fill: false,
        borderColor: 'yellow',
        backgroundColor: 'yellow',
        pointStyle: 'rectRot',
        tension: 0.4,
        yAxisID: 'y1', //Secondary Axis
      },

      {
        label: `${yKey5}`,
        data: superficialWaterVelocityValues,
        fill: false,
        borderColor: 'brown',
        backgroundColor: 'brown',
        tension: 0.4,
        yAxisID: 'y1', //Secondary Axis
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Velocities vs Chainage`,
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
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: yKey1,  //Elevation
        },
      },


      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Superficial Velocity (ft/s)' //HL
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
      <h2>Velocity Profile</h2>
      {fileDataICE.length > 0 ? <Line data={chartData} options={options} /> :null}

       {/* Button to show chunks */}

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button style={{fontSize: '18px', cursor: 'pointer'}} onClick={() => {
          const input = prompt('Enter chunk size in meters: ');
          if (input && !isNaN(input)) {
            window.open(`/velocity-chunks?chunk=${input}`, '_blank');
          }
        }}>
          Show Section-wise Charts
        </button>
      </div>
  </div>
  );
};

export default VelocityChart;

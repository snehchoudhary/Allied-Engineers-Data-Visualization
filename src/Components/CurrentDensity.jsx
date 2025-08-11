import React, { useContext } from 'react';
import { FileContext } from './FileContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  BarController,
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
  BarElement,
  BarController,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const CurrentDensityChart = () => {
  const { fileDataXLI } = useContext(FileContext);
  const navigate = useNavigate();

  console.log('CurrentDensityChart fileDataXLI:', fileDataXLI);

  const xKey = 'XLI Chainage (m)';
  const yKey1 = 'Soil Resistivity (Ohm-m)';
  const yKey2 = 'AC Current Density (A/m2)';
  const yKey3 = 'ACPSP (V)*10'
  const yKey4 = 'LT Line'
  const yKey5 = 'AC Interference'
  const yKey6 = 'Paved Road/Surface pavement'
  const yKey7 = 'Actual Dig sites'
  const yKey8 = 'Threshold AC Current Density (A/m2)'

  // Clean and trim column headers (just in case)
  const cleanData = fileDataXLI.map(row => {
    const cleaned = {};
    Object.keys(row).forEach(key => {
      cleaned[key.trim()] = row[key];
    });
    return cleaned;
  });

  const labels = cleanData.map((row) => row[xKey]);
  const soilResistivityValues = cleanData.map((row) => row[yKey1]);
  const AC_CurrentDensityValues = cleanData.map((row) => row[yKey2]);
  const ACPSPValues = cleanData.map((row) => row[yKey3]);
  const LTLineValues = cleanData.map((row) => row[yKey4]);
  const ACInterferenceValues = cleanData.map((row) => row[yKey5]);
  const PavedRoadSurfacePavementValues = cleanData.map((row) => row[yKey6]);
  const ActualDigSitesValues = cleanData.map((row) => row[yKey7]);
  const ThresholdACCurrentDensityValues = cleanData.map((row) => row[yKey8]);

  // console.log('CurrentDensityChart labels:', labels);
  // console.log('CurrentDensityChart soilResistivityValues:', soilResistivityValues);
  // console.log('CurrentDensityChart AC_CurrentDensityValues:', AC_CurrentDensityValues);
  // console.log('CurrentDensityChart ACPSPValues:', ACPSPValues);

  // console.log ('CurrentDensityChart LTLineValues:', LTLineValues);
  // console.log ('CurrentDensityChart ACInterferenceValues:', ACInterferenceValues);

  // console.log ('CurrentDensityChart PavedRoadSurfacePavementValues:', PavedRoadSurfacePavementValues);
  // console.log ('CurrentDensityChart ActualDigSitesValues:', ActualDigSitesValues);
  // console.log ('CurrentDensityChart ThresholdACCurrentDensityValues:', ThresholdACCurrentDensityValues);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${yKey1}`,
        data: soilResistivityValues,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        yAxisID: 'y', //Primary Axis
      },



      {
        label: `${yKey4}`,
        data: LTLineValues,
        fill: false,
        borderColor: 'green',
        backgroundColor: 'green',
        pointStyle: 'cross',
        tension: 0.4,
        yAxisID: 'y', //Primary Axis
      },

       {
        label: `${yKey5}`,
        data: ACInterferenceValues,
        fill: false,
        borderColor: '#00008B',
        backgroundColor: '#00008B',
        pointStyle: 'crossRot',
        tension: 0.4,
        yAxisID: 'y', //Primary Axis
      },

       {
        label: `${yKey6}`,
        data: PavedRoadSurfacePavementValues,
        fill: false,
        borderColor: '#00008B',
        backgroundColor: '#00008B',
        pointStyle: 'rectRot',
        tension: 0.4,
        yAxisID: 'y', //Primary Axis
      },


       {
        label: `${yKey2}`,
        data: AC_CurrentDensityValues,
        fill: false,
        borderColor: 'brown',
        backgroundColor: 'brown',
        tension: 0.4,
        yAxisID: 'y1', //Secondary Axis
      },
       {
        label: `${yKey3}`,
        data: ACPSPValues,
        fill: false,
        borderColor: 'lightgreen',
        backgroundColor: 'lightgreen',
        tension: 0.4,
        yAxisID: 'y1', //Secondary Axis
      },
       {
        type: 'bar',
        label: `${yKey7}`+ '(Bar)',
        data: ActualDigSitesValues,
        fill: false,
        borderRadius: 2,
        barPercentage: 1.0,
        borderColor: 'darkgreen',
        backgroundColor: 'darkgreen',
        tension: 0.4,
        yAxisID: 'y1', //Secondary Axis
      },
      {
        label: `${yKey8}`,
        data: ThresholdACCurrentDensityValues,
        fill: false,
        borderColor: '#fc03f8',
        backgroundColor: '#fc03f8',
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
        text: `Soil Resistivity & AC-Current Density/ACPSP vs XLI Chainage`,
      },
      legend: {
        display: true,
      },
    },

    scales: {
      x: {
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
          text: `${yKey2} & ${yKey3}` //HL
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
      <h2>Chart Of AC Current Density</h2>
      {fileDataXLI.length > 0 ? <Line data={chartData} options={options} /> :null}

       {/* Button to show chunks */}

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button style={{fontSize: '18px', cursor: 'pointer'}} onClick={() => {
          const input = prompt('Enter chunk size in meters: ');
          if (input && !isNaN(input)) {
            window.open(`/currentDensity-chunks?chunk=${input}`, '_blank');
          }
        }}>
          Show Section-wise Charts
        </button>
      </div>
  </div>
  );
};

export default CurrentDensityChart;

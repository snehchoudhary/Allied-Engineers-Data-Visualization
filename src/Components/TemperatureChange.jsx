// import React, { useContext } from 'react';
// import { FileContext } from './FileContext';
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import annotationPlugin from 'chartjs-plugin-annotation';
// import {useNavigate} from 'react-router-dom';


// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   annotationPlugin
// );

// const TemperatureChange = () => {
//   const { fileDataICE } = useContext(FileContext);
//   const navigate = useNavigate();

//   //console.log('PressureChange fileDataICE:', fileDataICE);

//   const xKey = 'Chainage (m)';
//   const yKey1 = 'Elevation (m)';
//   const yKey2 = 'Temperature change (°C)';

//   if (fileDataICE.length > 0) {
//     console.log('Keys of first row:', Object.keys(fileDataICE[0]));
//     console.log('First 5 rows:', fileDataICE.slice(0, 5));
//   }
//   const trimmedRawData = fileDataICE.map(row => {
//     const trimmedRow = {};
//     Object.keys(row).forEach(key => {
//       trimmedRow[key.trim()] = row[key];
//     });
//     return trimmedRow;
//   });
//   console.log('Raw temperature change values:', trimmedRawData.map(row => row['Temperature change (°C)']));
  
//   // Clean and trim column headers (just in case)
//   const cleanData = fileDataICE.map(row => {
//     const cleaned = {};
//     Object.keys(row).forEach(key => {
//       cleaned[key.trim()] = row[key];
//     });
//     return cleaned;
//   });

//   const elevationValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey1]) }));
//   let temperatureValues = cleanData
//     .map(row => {
//       const xVal = Number(row[xKey]);
//       const yRaw = row[yKey2];
//       const yVal = yRaw === '' || yRaw === null || yRaw === undefined ? NaN : parseFloat(yRaw);
//       return { x: xVal, y: yVal };
//     })
//     .filter(point => !isNaN(point.x) && !isNaN(point.y))
//     .sort((a, b) => a.x - b.x);
//   console.log('Processed temperature values:', temperatureValues);

//   const chartData = {
//     datasets: [
//       {
//         label: `${yKey1} `,
//         data: elevationValues,
//         fill: false,
//         borderColor: 'rgba(1, 6, 6, 1)',
//         backgroundColor: 'rgba(1, 6, 6, 1)',
//         tension: 0.4,
//         yAxisID: 'y', //Primary Axis
//         pointRadius: 0,
//       },

//       {
//         label: `${yKey2}`,
//         data: temperatureValues,
//         fill: false,
//         borderColor: '#FF4500',
//         backgroundColor: '#FF4500',
//         tension: 0,
//         yAxisID: 'y1', //Secondary Axis
//         pointRadius: 3,
//         borderWidth: 3,
//         // parsing: false,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     mainAspectRation: false,
//     plugins: {
//       title: {
//         display: true,
//         text: `Elevation & Temperature Change vs Chainage`,
//       },
//       legend: {
//         display: true,
//       },
//     },

//     scales: {
//       x: {
//         type: 'linear',
//         position: 'bottom',
//         title: {
//           display: true,
//           text: xKey,
//         },
//       },
//       y: {
//         display: true,
//         position: 'left',
//         title: {
//           display: true,
//           text: yKey1,  //Elevation
//         },
//       },

//       y1: {
//         display: true,
//         position: 'right',
//         title: {
//           display: true,
//           text: yKey2, //Temperature Change
//         },
//         grid: {
//           drawOnChartArea: false,  //avoids overlaps of grid lines
//         },
//         beginAtZero: false,
//         min: Math.min(...temperatureValues.map(p => p.y)) - 0.01,
//         max: Math.max(...temperatureValues.map(p => p.y)) + 0.01,
//         ticks: {
//           callback: function(value, index, ticks) {
//             console.log('y1 tick:', value);
//             return value;
//           }
//         }
//         // suggestedMin: Math.min(...temperatureValues.map(p => p.y)), // suggest min to lowest temperature value
//         // suggestedMax: Math.max(...temperatureValues.map(p => p.y)), // suggest max to highest temperature value
//       },
//     },
//   };

//   return (
//     <div style = {{ maxWidth: '100%',
//       margin: '21px auto',
//       padding: '2rem',
//       backgroundColor: '#ffffff',
//       borderRadius: '10px',
//       boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
//     }}>
//       <h2>Temperature Change (°C)</h2>
//       {fileDataICE.length > 0 ? <Line data={chartData} options={options} /> :null}

//        {/* Button to show chunks */}

//       <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
//         <button style={{fontSize: '18px', cursor: 'pointer'}} onClick={() => {
//           const input = prompt('Enter chunk size in meters: ');
//           if (input && !isNaN(input)) {
//             window.open(`/temperatureChange-chunks?chunk=${input}`, '_blank');
//           }
//         }}>
//           Show Section-wise Charts
//         </button>
//       </div>
//   </div>
//   );
// };

// export default TemperatureChange;

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

const TemperatureChange = () => {
  const { fileDataICE } = useContext(FileContext);
  const navigate = useNavigate();

  //console.log('PressureChange fileDataICE:', fileDataICE);

  const xKey = 'Chainage (m)';
  const yKey1 = 'Elevation (m)';
  const yKey2 = Object.keys(fileDataICE[0]).find(k => k.includes('Temperature change'));


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
  const temperatureValues = cleanData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey2]) }));

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
        label: `${yKey2}`,
        data: temperatureValues,
        fill: false,
        borderColor: '#FF8C00',
        backgroundColor: '#FF8C00',
        tension: 0.4,
        yAxisID: 'y1', //Secondary Axis
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    mainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Elevation & Temperature Change vs Chainage`,
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
          text: yKey2, //Pressure Change
        },
        grid: {
          drawOnChartArea: false,  //avoids overlaps of grid lines
        },
           suggestedMin: -0.09,  // ✅ Adjust according to your data range
    suggestedMax: 0,
    ticks: {
      callback: (value) => value,
    }
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
      <h2>Temperature Drop</h2>
      {fileDataICE.length > 0 ? <Line data={chartData} options={options} /> :null}

       {/* Button to show chunks */}

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button style={{fontSize: '18px', cursor: 'pointer'}} onClick={() => {
          const input = prompt('Enter chunk size in meters: ');
          if (input && !isNaN(input)) {
            window.open(`/temperatureChange-chunks?chunk=${input}`, '_blank');
          }
        }}>
          Show Section-wise Charts
        </button>
      </div>
  </div>
  );
};

export default TemperatureChange;

import React, { useContext, useEffect, useState } from 'react';
import { FileContext } from './FileContext';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import {useNavigate} from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

function ACVG() {
  const { fileDataXLI } = useContext(FileContext);
  const [chartData, setChartData] = useState({
    datasets: [],
  });

  const [chartOptions, setChartOptions] = useState({});
  // Allow user to add threshold values
  const [threshold1, setThreshold1] = useState(30);

  const navigate = useNavigate();

  useEffect(() => {
    if (fileDataXLI.length === 0) {
      console.warn('fileDataXLI is empty');
      return;
    }

    // Check if expected columns exist (case-insensitive)
    const hasVirtualDistance = fileDataXLI.some(item =>
      Object.keys(item).some(key => key.trim().toLowerCase() === 'virtualdistance (m)'));
    const hasACVG = fileDataXLI.some(item =>
      Object.keys(item).some(key => key.trim().toLowerCase() === 'acvg_vss_db'));

    if (!hasVirtualDistance || !hasACVG) {
      console.error('Required columns "VirtualDistance (m)" or "ACVG_VSS_DB" not found in data');
      return;
    }

    // Filter out rows where either label or data is missing or invalid
    const filteredData = fileDataXLI.filter(
      (item) => {
        const vdKey = Object.keys(item).find(key => key.trim().toLowerCase() === 'virtualdistance (m)');
        const acvgKey = Object.keys(item).find(key => key.trim().toLowerCase() === 'acvg_vss_db');
        return (
          item[vdKey] !== undefined &&
          item[vdKey] !== null &&
          item[vdKey].toString().trim() !== '' &&
          !isNaN(Number(item[vdKey])) &&
          item[acvgKey] !== undefined &&
          item[acvgKey] !== null &&
          item[acvgKey].toString().trim() !== '' &&
          !isNaN(Number(item[acvgKey]))
        );
      }
    );

    const labels = filteredData
      .map((item) => {
        const vdKey = Object.keys(item).find(key => key.trim().toLowerCase() === 'virtualdistance (m)');
        return Number(item[vdKey]);
      })
      .map((val) => {
        if (val >= 1000) {
          return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
          return val.toFixed(2);
        }
      });

    const dataOn = filteredData.map((item) => {
      const acvgKey = Object.keys(item).find(key => key.trim().toLowerCase() === 'acvg_vss_db');
      return Number(item[acvgKey]);
    });

    if (labels.length === dataOn.length) {
      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'ACVG_VSS_DB',
            data: dataOn,
            borderColor: 'lightgreen',
            backgroundColor: 'green',
            borderWidth: 1,
            fill: false,
            tension: 0.4,
          },
        ],
      });
    } else {
      console.warn('Labels and data length mismatch');
    }
  }, [fileDataXLI]);

  useEffect(() => {
    setChartOptions({
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Virtual Distance vs ACVG_VSS_DB',
        },
        // Adding 2 solid lines in chart
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: threshold1,
              yMax: threshold1,
              borderColor: 'black',
              borderWidth: 2,
              label: {
                display: true,
                content: `Threshold ${threshold1}`,
                position: 'start',
                color: 'red',
                font: 5,
              },
            },
          },
        },
      },

      scales: {
        x: {
          title: {
            display: true,
            text: 'Virtual Distance (m)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'ACVG_VSS_DB',
          },
        },
      },
    });
  }, [threshold1]);

  return (
    <div style = {{ maxWidth: '100%',
      margin: '21px auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <h1>ACVG_VSS_DB</h1>
      <h3>Adjust threshold value according to yourself</h3>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Threshold:
          <input type="number"
            value={threshold1}
            onChange={(e) => setThreshold1(Number(e.target.value))} />
        </label>
      </div>

      {chartData.datasets.length > 0 ? (
        <div>
          <Line options={chartOptions} data={chartData} />
        </div>
      ) : (
        <div>Loading...</div>
      )}

      {/* Button to show chunks */}

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button style ={{fontSize: '18px', cursor: 'pointer'}}  onClick={() => {
          const input = prompt('Enter chunk size in meters: ');
          if (input && !isNaN(input)) {
            window.open(`/acvg-chunks?chunk=${input}`, '_blank');
          }
        }}>
          Show Section-wise Charts
        </button>
      </div>

    </div> 
  );
}

export default ACVG;

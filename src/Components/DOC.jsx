import React, { useContext, useEffect, useState } from 'react';
import { FileContext } from './FileContext';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import {useNavigate} from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

function DOC() {
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
    const hasDOC = fileDataXLI.some(item =>
      Object.keys(item).some(key => key.trim().toLowerCase() === 'depthofcover (m)'));

    if (!hasVirtualDistance || !hasDOC) {
      console.error('Required columns "VirtualDistance (m)" or "DepthOfCover (m)" not found in data');
      return;
    }

    // Filter out rows where either label or data is missing or invalid
    const filteredData = fileDataXLI.filter(
      (item) => {
        const vdKey = Object.keys(item).find(key => key.trim().toLowerCase() === 'virtualdistance (m)');
        const docKey = Object.keys(item).find(key => key.trim().toLowerCase() === 'depthofcover (m)');
        return (
          item[vdKey] !== undefined &&
          item[vdKey] !== null &&
          item[vdKey].toString().trim() !== '' &&
          !isNaN(Number(item[vdKey])) &&
          item[docKey] !== undefined &&
          item[docKey] !== null &&
          item[docKey].toString().trim() !== '' &&
          !isNaN(Number(item[docKey]))
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
      const docKey = Object.keys(item).find(key => key.trim().toLowerCase() === 'depthofcover (m)');
      return Number(item[docKey]);
    });

    if (labels.length === dataOn.length) {
      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'DepthOfCover (m)',
            data: dataOn,
            borderColor: 'brown',
            backgroundColor: 'brown',
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
          text: 'Virtual Distance vs DepthOfCover (m)',
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
            text: 'Depth Of Cover (m)',
          },
        },
      },
    });
  }, [threshold1]);

  return (
    <div   style = {{ maxWidth: '100%',
      margin: '21px auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <h1>DepthOfCover (m)</h1>
      <h3>Adjust Threshold Value according to yourself</h3>

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
        <button style = {{fontSize: '18px', cursor: 'pointer'}}   onClick={() => {
          const input = prompt('Enter chunk size in meters: ');
          if (input && !isNaN(input)) {
            window.open(`/doc-chunks?chunk=${input}`, '_blank');
          }
        }}>
          Show Section-wise Charts
        </button>
      </div>
    </div> 
  );
}

export default DOC;

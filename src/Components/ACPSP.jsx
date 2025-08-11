import React, { useContext, useEffect, useState } from 'react';
import { FileContext } from './FileContext';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import {useNavigate} from 'react-router-dom';

//Register Charts.js components and Plugins
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

function ACPSP() {
  //Get parsed XLI file data from context
  const { fileDataXLI } = useContext(FileContext);

  //State for chart data and options
  const [chartData, setChartData] = useState({
    datasets: [],
  });
  const [chartOptions, setChartOptions] = useState({});

  // Threshold for annotation line(default 30)
  const [threshold1, setThreshold1] = useState(30);

  const navigate = useNavigate();

  /**
   * Chart data processing useEffect
   * -Validates and filters the data
   * -Converts it into chart-ready format
   */

  useEffect(() => {
    if (fileDataXLI.length === 0) {
      console.warn('fileDataXLI is empty');
      return;
    }

    // Check if expected headers exist (case-insensitive)
    const hasVirtualDistance = fileDataXLI.some(item =>
      Object.keys(item).some(key => key.trim().toLowerCase() === 'virtualdistance (m)'));
    const hasACVG = fileDataXLI.some(item =>
      Object.keys(item).some(key => key.trim().toLowerCase() === 'acpsp_onpotential'));

    if (!hasVirtualDistance || !hasACVG) {
      console.error('Required columns "VirtualDistance (m)" or "ACPSP_OnPotential" not found in data');
      return;
    }

    // Filter out rows where either label or data is missing or invalid
    const filteredData = fileDataXLI.filter(
      (item) => {
        const vdKey = Object.keys(item).find(key => key.trim().toLowerCase() === 'virtualdistance (m)');
        const acpspKey = Object.keys(item).find(key => key.trim().toLowerCase() === 'acpsp_onpotential');
        return (
          item[vdKey] !== undefined &&
          item[vdKey] !== null &&
          item[vdKey].toString().trim() !== '' &&
          !isNaN(Number(item[vdKey])) &&
          item[acpspKey] !== undefined &&
          item[acpspKey] !== null &&
          item[acpspKey].toString().trim() !== '' &&
          !isNaN(Number(item[acpspKey]))
        );
      }
    );

    //Format x-axis labels (virtual distances)
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

      //Y-axis values (ACPSP_OnPotential)
    const dataOn = filteredData.map((item) => {
      const acpspKey = Object.keys(item).find(key => key.trim().toLowerCase() === 'acpsp_onpotential');
      return Number(item[acpspKey]);
    });

    //Set chart data if label and data lengths match
    if (labels.length === dataOn.length) {
      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'ACPSP_OnPotential',
            data: dataOn,
            borderColor: 'orange',
            backgroundColor: 'orange',
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

  /**
   * Chart options and threshold line setup
   * Updates whenever threshold1 changes
   */

  useEffect(() => {
    setChartOptions({
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Virtual Distance vs ACPSP_OnPotential',
        },
        // Adding 1 solid lines in chart
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
                font: {
                  size: 12,
                  weight: 'bold',
                },
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
            text: 'ACPSP_OnPotential',
          },
        },
      },
    });
  }, [threshold1]);

  

  return (
    <div  style={{
      maxWidth: '100%',
      margin: '21px auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <h1>ACPSP_OnPotential</h1>
       <h3>Adjust Threshold Value according to yourself</h3>

      {/* Threshold Input */}
       <div style={{ marginBottom: '1rem' }}>
        <label>
          Threshold:
          <input type="number"
            value={threshold1}
            onChange={(e) => {
             const val = Number(e.target.value);
            if (!isNaN(val)) setThreshold1(val);
        }}

            />
        </label>
      </div> 


     {/* Line Chart */}
      {chartData.datasets.length > 0 ? (
        <div>
          <Line options={chartOptions} data={chartData} />
        </div>
      ) : (
        <div>Loading...</div>
      )}

      {/* Button to navigate to section wise chart view */}

       <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button style={{fontSize: '18px', cursor: 'pointer'}} onClick={() => {
          const input = prompt('Enter chunk size in meters: ');
          if (input && !isNaN(input)) {
            window.open(`/acpsp-chunks?chunk=${input}`, '_blank');
          }
        }}>
          Show Section-wise Charts
        </button>
      </div> 
    </div> 
  );
}

export default ACPSP;

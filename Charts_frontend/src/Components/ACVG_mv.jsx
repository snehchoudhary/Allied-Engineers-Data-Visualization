import React, {useContext, useEffect, useState } from 'react';
import { FileContext } from './FileContext';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart as ChartJS , CategoryScale,LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import {useNavigate} from 'react-router-dom';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

function ACVG_mv () {
  const {fileDataXLI} = useContext(FileContext);

  const [chartData, setChartData] = useState({
    datasets: [],
  });

  const [chartOptions, setChartOptions] = useState({});

  // Allow user to add threshold(range) values 
  
  const [thresholdMin, setThresholdMin] = useState(0);
  const [thresholdMax, setThresholdMax] = useState(100);
  const [error, setError] = useState('');
   const navigate = useNavigate();

  useEffect(() => {
    if(fileDataXLI.length === 0) {
      console.warn('fileDataXLI is empty');
      return;
    }

    // Validate thresholds
    if (thresholdMin < 0 || thresholdMax > 100 || thresholdMin > thresholdMax) {
      setError('Thresholds must be between 0 and 100, and min ≤ max');
      return;
    } else {
      setError('');
    }

    const filteredData = fileDataXLI.filter(
      (item) => {
        const x = Number(item["VirtualDistance (m)"]);
        const y = Number(item["ACVG"]);

        return (
          !isNaN(x) &&
          !isNaN(y) &&
          item["VirtualDistance (m)"] !== undefined &&
          item["VirtualDistance (m)"] !== null &&
          item["VirtualDistance (m)"].toString().trim() !== '' &&
          item["ACVG"] !== undefined &&
          item["ACVG"] !== null &&
          item["ACVG"].toString().trim() !== '' &&
          y * 1000 >= thresholdMin &&
          y * 1000 <= thresholdMax
        );
      }
    );

        const labels = filteredData
          .map((item) => Number(item["VirtualDistance (m)"]))
          .map((val) => {
            if (val >= 1000) {
              return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else {
              return val.toFixed(2);
            }
          });
        const dataOn = filteredData.map((item) => Number(item["ACVG"]));

        if (labels.length === dataOn.length) {
          setChartData({
            labels: labels,
            datasets: [
              {
                label: 'ACVG * 1000 (mV)',
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

        setChartOptions({
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Virtual Distance vs ACVG (mV)',
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
                text: 'ACVG (mV)',
              },
            },
          },
        });
  }, [fileDataXLI, thresholdMin, thresholdMax]);

  return (
    <div style = {{ maxWidth: '100%',
      margin: '21px auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <h1>ACVG x 1000 (mV)</h1>
      <h3>Extract data for Min and Max Thresholds</h3>

       <div style={{ marginBottom: '1rem'}}>
    
    </div>

    <div style={{ marginBottom: '1rem'}}>
    <label>
      Min Threshold:
      <input type="number"
       value={thresholdMin}
       onChange={(e) => setThresholdMin(Number(e.target.value))} style={{ marginLeft: '0.5rem', marginRight: '1rem'}}
      />
    </label>

    <label>
      Max Threshold:
      <input type="number"
       value={thresholdMax}
       onChange={(e) => setThresholdMax(Number(e.target.value))} style={{ marginLeft: '0.5rem', marginRight: '1rem'}}
      />
    </label>
    </div>

    {error && <p style={{ color: 'red' }}>{error}</p>}

      {chartData.datasets.length > 0 ? (
        <div>
          <Line options={chartOptions} data={chartData} />
        </div>
      ) : (
        <div>Loading...</div>
      )}

       {/* Button to show chunks */}

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button style={{fontSize: '18px', cursor: 'pointer'}} onClick={() => {
          const input = prompt('Enter chunk size in meters: ');
          if (input && !isNaN(input)) {
            window.open(`/acvg_mv-chunks?chunk=${input}`, '_blank');
          }
        }}>
          Show Section-wise Charts
        </button>
      </div>

    </div>
  );
}

export default ACVG_mv;


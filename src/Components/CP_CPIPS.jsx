import React, {useContext, useEffect, useState } from 'react';
import { FileContext } from './FileContext';
import {Line} from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart as ChartJS , CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import {useNavigate} from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

function Home () {
  const {fileDataXLI} = useContext(FileContext);
  const [chartData, setChartData] = useState({
    datasets: [],
  });
  const [chartOptions, setChartOptions] = useState({});

  // Allow user to add threshold values 
  const [threshold1, setThreshold1] = useState(-0.850);
  const [threshold2, setThreshold2] = useState(-1.200);

 const navigate = useNavigate();  

  useEffect(() => {

    if (fileDataXLI.length === 0) {
       console.warn('fileDataXLI is empty');
      return;
    }

        // Filter out rows where either label or data is missing or invalid
        const filteredData = fileDataXLI.filter(
          (item) =>
            item["VirtualDistance (m)"] !== undefined &&
            item["VirtualDistance (m)"] !== null &&
            item["VirtualDistance (m)"].toString().trim() !== '' &&
            !isNaN(Number(item["VirtualDistance (m)"])) &&
            item["CPCIPS_OnPotential"] !== undefined &&
            item["CPCIPS_OnPotential"] !== null &&
            item["CPCIPS_OnPotential"].toString().trim() !== '' &&
            !isNaN(Number(item["CPCIPS_OnPotential"])) &&
            item["CPCIPS_InstantOffPotential"] !== undefined &&
            item["CPCIPS_InstantOffPotential"] !== null &&
            item["CPCIPS_InstantOffPotential"].toString().trim() !== '' &&
            !isNaN(Number(item["CPCIPS_InstantOffPotential"]))
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
        const dataOn = filteredData.map((item) => Number(item["CPCIPS_OnPotential"]));
        const dataOff = filteredData.map((item) => Number(item["CPCIPS_InstantOffPotential"]));

        // console.log('Filtered Labels length:', labels.length);
        // console.log('Filtered On Potential Data length:', dataOn.length);
        // console.log('Filtered Off Potential Data length:', dataOff.length);
        // console.log('First 5 labels:', labels.slice(0, 5));
        // console.log('First 5 On Potential data points:', dataOn.slice(0, 5));
        // console.log('First 5 Off Potential data points:', dataOff.slice(0, 5));

        if (labels.length === dataOn.length && labels.length === dataOff.length) {
          setChartData({
            labels: labels,
            datasets: [
              {
                label: 'CPCIPS On Potential',
                data: dataOn,
                borderColor: 'lightgreen',
                backgroundColor: 'green',
                borderWidth: 1,
                fill: false,
                tension: 0.4,
              },
              {
                label: 'CPCIPS Instant Off Potential',
                data: dataOff,
                borderColor: 'red',
                backgroundColor: 'red',
                borderWidth: 1,
                fill: false,
                tension: 0.4,
              },
            ],
          });
        } else {
          console.warn('Labels and data length mismatch');
        }
        //  },
    // });
  }, [fileDataXLI]);


  // Update annotations lines dynamically
  useEffect (() => {
        setChartOptions({
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Virtual Distance vs CPCIPS Potentials',
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

                  label:{
                    display: true,
                    content: `Threshold ${threshold1}`,
                    position: 'start',
                    color: 'red',
                    font: 5,
                  },
              },

              line2: {
                type: 'line',
                yMin: threshold2,
                yMax: threshold2,
                borderColor: 'black',
                borderWidth: 2,

                label: {
                  display: true,
                  content: `Threshold ${threshold2}`,
                  position: 'start',
                  color: 'lightgreen',
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
              reverse: true,
              
              title: {
                display: true,
                text: 'CPCIPS Potentials',
              }
            }
          }
      });
      }, [threshold1, threshold2]);
     

  return (
    <div   style = {{ maxWidth: '100%',
      margin: '21px auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <h1>CIPS Potentials</h1>
      <h3>Adjust threshold values according to yourself</h3>

      <div style={{ marginBottom: '1rem'}}>
    <label>
      Instant Off Min Potential:
      <input type="number"
      value= {threshold1}
      onChange={(e) => setThreshold1(Number(e.target.value))} />
    </label>

<br />

    <label>
      Instant Off Max Potential:
      <input type="number"
      value= {threshold2}
      onChange={(e) => setThreshold2(Number(e.target.value))} />
    </label>
  </div>
      {chartData.datasets.length > 0 ? (
        <div>
          <Line options={chartOptions} data={chartData} />
        </div>
      ) : (
        <div>Loading...</div>
      )}

        {/* Button to show chunk charts  */}
      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button style={{fontSize: '18px', cursor: 'pointer'}}  onClick={() => {
          const input = prompt('Enter chunk size in meters: ');
          if (input && !isNaN(input)) {
            window.open(`/cpcips-chunks?chunk=${input}`, '_blank');
          }
        }}>
          Show Section-wise Charts
        </button>
      </div>

    </div>
  );
}

export default Home
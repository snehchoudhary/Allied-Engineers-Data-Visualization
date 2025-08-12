import React, { useContext, useState } from 'react';
import { FileContext } from './FileContext';
import { useLocation } from 'react-router-dom';
import annotationPlugin from 'chartjs-plugin-annotation';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

const CPCIPS_Chunks = () => {
  const { fileDataXLI } = useContext(FileContext);
  const query = new URLSearchParams(useLocation().search);
  const chunkSize = parseInt(query.get('chunk') || '500');
  // Allow user to add threshold values 
    const [threshold1, setThreshold1] = useState(-0.850);
    const [threshold2, setThreshold2] = useState(-1.200);

  const filtered = fileDataXLI.filter(
    (item) =>
      item['VirtualDistance (m)'] &&
      item['CPCIPS_OnPotential'] &&
      !isNaN(item['VirtualDistance (m)']) &&
      !isNaN(item['CPCIPS_OnPotential'])&&
      item['CPCIPS_InstantOffPotential']&&
      !isNaN(item['CPCIPS_InstantOffPotential'])
  );

  const maxDist = Math.max(...filtered.map(row => Number(row['VirtualDistance (m)'])));
  const chunks = [];

  for (let start = 0; start < maxDist; start += chunkSize) {
    const end = start + chunkSize;
    const chunk = filtered.filter(row =>
      Number(row['VirtualDistance (m)']) >= start &&
      Number(row['VirtualDistance (m)']) < end
    );

    if (chunk.length > 0) {
      const labels = chunk.map(item => Number(item['VirtualDistance (m)']).toFixed(2));
      const dataOn = chunk.map(item => Number(item['CPCIPS_OnPotential']));
       const dataOff = chunk.map(item => Number(item['CPCIPS_InstantOffPotential']));

      chunks.push({
        title: `${start}m - ${end}m`,
        data: {
          labels,
          datasets: [
            {
              label: 'CPCIPS_OnPotential',
              data: dataOn,
              borderColor: 'lightgreen',
              backgroundColor: 'green',
              tension: 0.4,
              fill: false,
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
        },
      },);
    }
  }

  return (
    <div style= {{padding: '2rem'}}>
      <h2>Section-wise Charts of CPCIPS Potentials for (Every {chunkSize}m)</h2>
      <h3>Adjust Threshold Values according to yourself</h3>

       <div style={{ marginBottom: '1rem' }}>
        <label>
          Instant Off Min Potential:
          <input type="number"
            value= {threshold1}
            onChange={(e) => setThreshold1(Number(e.target.value))} />
        </label>
      </div> 

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Instant Off Max Potential:
          <input type="number"
            value= {threshold2}
            onChange={(e) => setThreshold2(Number(e.target.value))} />
        </label>
      </div> 

      {chunks.map((chunk, i) => (
        <div key={i} style={{ marginBottom: '2rem',
           
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              backgroundColor: '#fff'
         }}>
          <h3>{chunk.title}</h3>
          <Line data={chunk.data} options={{ responsive: true, plugins: { legend: { position: 'top' } ,
          
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
            }
          },
          y: {
            title: {
              display: true,
              text: 'CPCIPS Potentials',
            },
          },
        },
        }} />
        </div>
      ))}
    </div>
  );
};

export default CPCIPS_Chunks;

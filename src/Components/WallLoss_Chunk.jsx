import React, { useContext } from 'react';
import { FileContext } from './FileContext';
import { useLocation } from 'react-router-dom';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WallLoss_Chunk = () => {
  const { fileDataICE } = useContext(FileContext);
  const query = new URLSearchParams(useLocation().search);
  const chunkSize = parseInt(query.get('chunk') || '500');

  const getKeyInsensitive = (obj, key) => {
    // Match key ignoring case and optional suffix like _1, _2 etc.
    const regex = new RegExp(`^${key.toLowerCase().replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}(?:_\\d+)?$`);
    return Object.keys(obj).find(k => regex.test(k.trim().toLowerCase()));
  };

  const getKeyByKeywords = (obj, keywords) => {
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    return Object.keys(obj).find(k => {
      const lowerKey = k.toLowerCase();
      return lowerKeywords.every(kw => lowerKey.includes(kw));
    });
  };

  if (!fileDataICE || fileDataICE.length === 0) {
    return <div style={{ padding: '2rem' }}>⚠️ Please upload the ICE file first.</div>;
  }

  console.log('Available keys in ICE file:', Object.keys(fileDataICE[0]));

  // Adjust keys to match available columns with spaces trimmed and suffixes handled
  const distKey = getKeyInsensitive(fileDataICE[0], 'Chainage (m)');
  const worstKey = getKeyByKeywords(fileDataICE[0], ['wall loss', 'worst']);
  const realisticKey = getKeyByKeywords(fileDataICE[0], ['wall loss', 'realistic']);
  const elevationKey = getKeyInsensitive(fileDataICE[0], 'Elevation (m)');
  const generalKey = getKeyByKeywords(fileDataICE[0], ['wall loss', 'general']);

  if (!distKey || !worstKey || !realisticKey || !elevationKey) {
    return (
      <div style={{ padding: '2rem' }}>
        ⚠️ Required columns not found in ICE file data. Available columns: {Object.keys(fileDataICE[0]).join(', ')}
      </div>
    );
  }

  console.log('Keys used for filtering:', { distKey, worstKey, realisticKey, elevationKey, generalKey });

  const filtered = fileDataICE.filter((item, index) => {
    const distVal = item[distKey];
    const worstVal = item[worstKey];
    const realisticVal = item[realisticKey];
    const elevationVal = item[elevationKey];
    const generalVal = item[generalKey];

    // Further relax filtering: allow empty strings for worstVal and realisticVal
    const isValid =
      (distVal === undefined || distVal === '' || !isNaN(parseFloat(distVal))) &&
      (worstVal === undefined || worstVal === '' || !isNaN(parseFloat(worstVal))) &&
      (realisticVal === undefined || realisticVal === '' || !isNaN(parseFloat(realisticVal))) &&
      (elevationVal === undefined || elevationVal === '' || !isNaN(parseFloat(elevationVal))) &&
      generalVal !== undefined &&
      generalVal !== '' &&
      !isNaN(parseFloat(generalVal));

    if (!isValid) {
      console.log(`Filtered out row ${index}:`, {
        distVal,
        worstVal,
        realisticVal,
        elevationVal,
        generalVal,
      });
    }

    return isValid;
  });

  // Replace empty strings with null in data arrays before charting to show gaps
  const prepareData = (arr) => arr.map(v => (v === '' || v === undefined ? null : Number(v)));

  // Remove commas from distance values before converting to numbers
  const sanitizedDistValues = filtered.map(row => {
    const val = row[distKey];
    if (typeof val === 'string') {
      return val.replace(/,/g, '');
    }
    return val;
  });

  console.log('Sanitized dist values:', sanitizedDistValues);

  const maxDist = Math.max(...sanitizedDistValues.map(v => Number(v)));
  if (isNaN(maxDist)) {
    console.warn('Max distance is NaN, setting maxDist to 0');
  }
  const safeMaxDist = isNaN(maxDist) ? 0 : maxDist;

  console.log('Filtered data length:', filtered.length);
  console.log('Max distance:', safeMaxDist);
  console.log('Chunk size:', chunkSize);

  const chunks = [];

  for (let start = 0; start < safeMaxDist; start += chunkSize) {
    const end = start + chunkSize;
    const chunk = filtered.filter(row => {
      const distValRaw = row[distKey];
      let distValNum = distValRaw;
      if (typeof distValRaw === 'string') {
        distValNum = Number(distValRaw.replace(/,/g, ''));
      } else {
        distValNum = Number(distValRaw);
      }
      return distValNum >= start && distValNum < end;
    });

    console.log(`Chunk from ${start} to ${end} meters has ${chunk.length} rows`);

    if (chunk.length > 0) {
      const labels = chunk.map(item => Number(item[distKey]).toFixed(2));
      const dataOn = prepareData(chunk.map(item => item[worstKey]));
      const dataOff = prepareData(chunk.map(item => item[realisticKey]));
      const elevationValues = prepareData(chunk.map(item => item[elevationKey]));
      const generalValues = prepareData(chunk.map(item => item[generalKey]));

      console.log('Chunk data:', {
        labels,
        dataOn,
        dataOff,
        elevationValues,
        generalValues,
      });

      chunks.push({
        title: `${start}m - ${end}m`,
        data: {
          labels,
          datasets: [
            {
              label: '%Wall Loss - Worst',
              data: dataOn,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              borderWidth: 2,
              showLine: true,
              hidden: false,
              order: 2,
              yAxisID: 'y',
            },
            {
              label: '%Wall Loss - Realistic',
              data: dataOff,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              borderWidth: 2,
              showLine: true,
              hidden: false,
              order: 3,
              yAxisID: 'y',
            },
            {
              label: `Elevation (m)`,
              data: elevationValues,
              fill: false,
              borderColor: 'black',
              backgroundColor: 'black',
              tension: 0.4,
              yAxisID: 'y1',
              pointRadius: 2,
              borderWidth: 1,
              hidden: false,
              order: 1,
            },
             {
              label: 'Wall Loss % (General)',
              data: generalValues,
              borderColor: 'rgba(8, 130, 30, 1)',
              backgroundColor: 'rgba(8, 130, 30, 0.5)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              borderWidth: 2,
              showLine: true,
              hidden: false,
              order: 4,
              yAxisID: 'y',
            },
          ],
        },
      });
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Section-wise Charts of %Wall-Loss for (Every {chunkSize}m)</h2>
      {chunks.length === 0 ? (
        <div style={{ padding: '2rem' }}>
          ⚠️ No data chunks found. Please check your data format or chunk size.
        </div>
      ) : (
        chunks.map((chunk, i) => (
          <div key={i} style={{
            marginBottom: '2rem',
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            backgroundColor: '#fff'
          }}>
            <h3>{chunk.title}</h3>

            <Line data={chunk.data} options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Chainage (m)',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: '%Wall Loss (Worst + Realistic)',
                  }
                },
                y1: {
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Elevation (m)',
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                },
              }
            }} />
          </div>
        ))
      )}
    </div>
  );
};

export default WallLoss_Chunk;

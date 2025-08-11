import React, { useState, useContext } from 'react';
import { FileContext } from './FileContext';

const FileUploader = ({ setMarkers }) => {
  const [fileNameXLI, setFileNameXLI] = useState('');
  const [fileNameICE, setFileNameICE] = useState('');
  const { handleFileUpload } = useContext(FileContext);

  const onFileChangeXLI = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileNameXLI(file.name);

    // Use FileContext's handleFileUpload to update fileData in context
    handleFileUpload(file, 'XLI');

    // Additionally, parse file here to extract markers for map
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        // Parse CSV manually to extract lat/lng for markers
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const latIndex = headers.findIndex(h => h.trim().toLowerCase() === 'latitude');
        const lngIndex = headers.findIndex(h => h.trim().toLowerCase() === 'longitude');

        if (latIndex === -1 || lngIndex === -1) {
          alert('CSV file must contain Latitude and Longitude columns');
          return;
        }
        const markers = lines.slice(1).map(line => {
          const cols = line.split(',');
          return {
            lat: parseFloat(cols[latIndex]),
            lng: parseFloat(cols[lngIndex]),
          };
        }).filter(m => !isNaN(m.lat) && !isNaN(m.lng));
        setMarkers(markers);
      };
      reader.readAsText(file);
    } else {
      alert('Currently only CSV files are supported for marker extraction.');
    }
  };

  const onFileChangeICE = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileNameICE(file.name);

    // Use FileContext's handleFileUpload to update fileData in context
    handleFileUpload(file, 'ICE');

    // Additional parsing logic for second file can be added here if needed
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Upload CSV Files</h1>


       <div style={{ display: 'flex', justifyContent: 'center', gap: '39px' }}>
      <div>
        <label><h2>Upload CSV File for EC:</h2> </label><br/>
        <input
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={onFileChangeXLI}
        />
        {fileNameXLI && <p><strong>Uploaded EC file:</strong> {fileNameXLI}</p>}
      </div>

      <div>
        <label><h2>Upload CSV File for IC:</h2></label><br/>
        
        <input
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={onFileChangeICE}
        />
        {fileNameICE && <p><strong>Uploaded IC File:</strong> {fileNameICE}</p>}
      </div>
      </div>

    </div>
  );
};

export default FileUploader;

import React, { createContext, useState, useEffect } from 'react';
import {parse} from 'papaparse';
import * as XLSX from 'xlsx';
import { saveToIndexedDB, loadFromIndexedDB, deleteFromIndexedDB } from './indexedDb';

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [fileDataXLI, setFileDataXLI] = useState([]);
  const [fileDataICE, setFileDataICE] = useState([]);
  const [markersXLI, setMarkersXLI] = useState([]);

 
  // Load from IndexedDB on initial load
  useEffect(() => {
    (async () => {
      const XLI = await loadFromIndexedDB('fileDataXLI');
      const ICE = await loadFromIndexedDB('fileDataICE');
      const markers = await loadFromIndexedDB('markersXLI');

      if (XLI) setFileDataXLI(XLI);
      if (ICE) setFileDataICE(ICE);
      if (markers) setMarkersXLI(markers);
    })();
  }, []);


  // ✅ Function to extract markers from data
  const extractMarkers = (data) => {
    const latKey = Object.keys(data[0] || {}).find(k => k.toLowerCase() === 'latitude');
    const lngKey = Object.keys(data[0] || {}).find(k => k.toLowerCase() === 'longitude');
    if (!latKey || !lngKey) return [];

    return data
      .map(row => {
        const lat = parseFloat(row[latKey]);
        const lng = parseFloat(row[lngKey]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
        return null;
      })
      .filter(Boolean);
  };

   // Parse CSV or Excel files
  const handleFileUpload = (file, type) => {
    console.log('handleFileUpload called with file:', file, 'type:', type);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target.result;
      const fileType = type.toLowerCase();

      parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          console.log('papaparse complete callback, results:', results);
          const parsedData = results.data;
          if (fileType === 'xli') {
            setFileDataXLI(parsedData);
            setMarkersXLI(extractMarkers(parsedData));
            await saveToIndexedDB('fileDataXLI', parsedData);
          } else if (fileType === 'ice') {
            setFileDataICE(parsedData);
            await saveToIndexedDB('fileDataICE', parsedData);
          } else if (fileType === 'markersxli') {
            setMarkersXLI(parsedData);
            await saveToIndexedDB('markersXLI', parsedData);
          }
        },
      });
    };

    reader.readAsText(file);
  };

  const clearFileData = async () => {
    setFileDataXLI([]);
    setFileDataICE([]);
    setMarkersXLI([]);

    await deleteFromIndexedDB('fileDataXLI');
    await deleteFromIndexedDB('fileDataICE');
    await deleteFromIndexedDB('markersXLI');
  };

  return (
    <FileContext.Provider 
    value={{ fileDataXLI, fileDataICE, markersXLI, handleFileUpload, clearFileData, extractMarkers }}>
      {children}
    </FileContext.Provider>
  );
};


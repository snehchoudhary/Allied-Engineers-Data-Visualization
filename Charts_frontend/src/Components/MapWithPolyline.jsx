import React, { useContext, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FileContext } from './FileContext';

const MapTilerMap = () => {
  const { markersXLI } = useContext(FileContext);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  console.log('markersXLI:', markersXLI);

  const maptilerKey = 'Q858GrAMqnhLjtnBRyj5';

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${maptilerKey}`,
      center: [77.5946, 12.9716],
      zoom: 3,
    });
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    map.scrollZoom.disable();
    if (!map || !markersXLI || markersXLI.length < 2) return;

    const routeCoords = markersXLI.map(({ lng, lat }) => [lng, lat]);

    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: routeCoords,
          },
          properties: {},
        },
      ],
    };

    const addLayer = () => {
      if (map.getLayer('route-line')) {
        map.removeLayer('route-line');
      }
      if (map.getSource('route')) {
        map.removeSource('route');
      }

      map.addSource('route', {
        type: 'geojson',
        data: geojson,
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ff0000',
          'line-width': 4,
        },
      });

      map.fitBounds(getBounds(routeCoords), {
        padding: 40,
      });
    };

    if (map.isStyleLoaded()) {
      addLayer();
    } else {
      map.on('load', addLayer);
    }
  }, [markersXLI]);

  const getBounds = (coords) => {
    const bounds = new maplibregl.LngLatBounds();
    coords.forEach(([lng, lat]) => bounds.extend([lng, lat]));
    return bounds;
  };

  return (
    <>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '50vh', margin: '20px' }}
        onMouseEnter={() => {
          if (mapRef.current) mapRef.current.scrollZoom.enable();
        }}
        onMouseLeave={() => {
          if (mapRef.current) mapRef.current.scrollZoom.disable();
        }}
      />
      
    </>
  );
};

export default MapTilerMap;

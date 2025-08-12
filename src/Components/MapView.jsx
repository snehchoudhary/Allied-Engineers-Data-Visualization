import React from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const center = {
  lat: 20.5937,
  lng: 78.9629,
};

function MapView({ markers }) {
  const GOOGLE_MAPS_API_KEY = "AIzaSyBGbJzKewQxP8AG3pxM-pOHC7DE35Xt_-M"; // replace with your key

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={5}>
        {markers.map((marker, index) => (
          <Marker key={index} position={marker} />
        ))}

        {markers.length > 1 && (
          <Polyline
            path={markers}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default MapView;


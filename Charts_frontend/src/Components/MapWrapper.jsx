import React from "react";
import MapView from "./MapView";

function MapWrapper({markers}) {
  
  return <MapView markers={markers} />;
}

export default MapWrapper;

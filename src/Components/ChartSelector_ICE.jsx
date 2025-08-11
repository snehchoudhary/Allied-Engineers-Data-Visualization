import React, {useState} from "react";
import ElevationChart from "./ElevationChart";
import CorrosionRate from "./CR";
import WallLoss from "./WallLoss";
import PressureChange from "./PressureChange";
import TemperatureChange from "./TemperatureChange";
import VelocityChart from "./VelocityChart";
import ElevationProfileChart from "./ElevationProfile";
import FlowRegimeChart from "./FlowRegime";
import AvgHLChart from "./AvgHL";

const ChartSelector_ICE = () => {
    console.log("ChartSelector_ICE rendered");
    const [selectedChart, setSelectedChart] = useState([]);

    const handleCheckboxChange = (chartId) => {
       setSelectedChart((prevSelected) => 
    prevSelected.includes(chartId) ? prevSelected.filter((id) => id !== chartId): // uncheck
       [...prevSelected, chartId]
 ); // check
    };

     return (
        <div style={{ padding: "1rem", fontSize: '20px'}}>
            <h2>Select a chart for IC:</h2>

            <label style={{cursor: 'pointer'}}>
                <input type="checkbox"
                checked={selectedChart.includes("elevation")}
                onChange={() => handleCheckboxChange("elevation")} />
                Liquid Hold-Up
            </label>

            <br />

            <label style={{cursor: 'pointer'}}>
                <input type="checkbox"
                checked={selectedChart.includes("corrosionRate")}
                onChange={() => handleCheckboxChange("corrosionRate")} />
                Corrosion Rate
            </label>

            <br />

             <label style={{cursor: 'pointer'}}>
                <input type="checkbox"
                checked={selectedChart.includes("wallLoss")}
                onChange={() => handleCheckboxChange("wallLoss")} />
                % Wall-Loss
            </label>

            <br />

            <label style={{cursor: 'pointer'}}>
                <input type="checkbox"
                checked={selectedChart.includes("pressureChange")}
                onChange={() => handleCheckboxChange("pressureChange")} />
                Pressure Drop
            </label>

            <br />

            <label style={{cursor: 'pointer'}}>
                <input type="checkbox"
                checked={selectedChart.includes("temperatureChange")}
                onChange={() => handleCheckboxChange("temperatureChange")} />
                Temperature Drop
            </label>

            <br />

            <label style={{cursor: 'pointer'}}>
                <input type="checkbox"
                checked={selectedChart.includes("velocityChart")}
                onChange={() => handleCheckboxChange("velocityChart")} />
                Velocity Profile
            </label>

            <br />

               <label style={{cursor: 'pointer'}}>
                <input type="checkbox"
                checked={selectedChart.includes("profileAngleChart")}
                onChange={() => handleCheckboxChange("profileAngleChart")} />
                Inclination Angle 
            </label>

            <br />

              <label style={{cursor: 'pointer'}}>
                <input type="checkbox"
                checked={selectedChart.includes("flowRegimeChart")}
                onChange={() => handleCheckboxChange("flowRegimeChart")} />
                Flow Regime
            </label>

            <br />

             <label style={{cursor: 'pointer'}}>
                <input type="checkbox"
                checked={selectedChart.includes("avgHLChart")}
                onChange={() => handleCheckboxChange("avgHLChart")} />
                Liquid HoldUp vs DEx
            </label>

            {selectedChart.includes("elevation") && <ElevationChart/>}
            {selectedChart.includes("corrosionRate") && <CorrosionRate/>}
            {selectedChart.includes("wallLoss") && <WallLoss/>}
            {selectedChart.includes("pressureChange") && <PressureChange/>}
            {selectedChart.includes("temperatureChange") && <TemperatureChange/>}
            {selectedChart.includes("velocityChart") && <VelocityChart/>}
            {selectedChart.includes("profileAngleChart") && <ElevationProfileChart/>}
            {selectedChart.includes("flowRegimeChart") && <FlowRegimeChart/>}
            {selectedChart.includes("avgHLChart") && <AvgHLChart/>}
            </div>
            )
}
export default ChartSelector_ICE
           
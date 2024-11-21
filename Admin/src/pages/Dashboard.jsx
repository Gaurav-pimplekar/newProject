import React, { useEffect, useState } from "react";
import "../styles/dashboard.css";
import SingleCard from "../components/reuseable/SingleCard";

import MileChart from "../charts/MileChart";
import CarStatsChart from "../charts/CarStatsChart";
import RecommendCarCard from "../components/UI/RecommendCarCard";

import recommendCarsData from "../assets/dummy-data/recommendCars";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getTotalVehicles } from "../storage/adminStorage";
import axios from "axios";

let carObj = {
  title: "Total Cars",
  totalNumber: 0,
  icon: "ri-police-car-line",
};

let tripObj = {
  title: "Daily Trips",
  totalNumber: 0,
  icon: "ri-steering-2-line",
};

let clientObj = {
  title: "Clients Monthly",
  totalNumber: "0k",
  icon: "ri-user-line",
};

let distanceObj = {
  title: "Kilometers Monthly",
  totalNumber: 2167,
  icon: "ri-timer-flash-line",
};

const Dashboard = () => {
  const [datas, setDatas] = useState(null);
  const [totalTrip, setTotalTrip] = useState(0);
  const state = useSelector((state) => state.admin);
  const dispatch = useDispatch();

  console.log(state, totalTrip);

  useEffect(() => {
    const fetchData = () => {
      if (datas == null) {
        fetch("http://localhost:8080/totalVehicles")
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            if (data.length > 0) {
              setDatas(data[0]);
              console.log(data[0]);
              carObj = {
                title: data[0].name,
                totalNumber: data[0].value,
              };
              tripObj = {
                title: data[1].name,
                totalNumber: data[1].value,
              };
              clientObj = {
                title: data[2].name,
                totalNumber: data[2].value,
              };
              distanceObj = {
                title: data[3].name,
                totalNumber: data[2].value,
              };
            } else {
              console.warn("No data found");
            }
          })
          .catch((error) =>
            console.error("There was a problem with the fetch operation:", error)
          );
      }
    };

    fetchData();
    dispatch(getTotalVehicles());
  }, [datas, dispatch]);


  useEffect(()=>{
    const getTotal = async ()=>{
      const res = await axios.get("http://localhost:8080/api/todaysTripsCount");
      setTotalTrip(res?.data?.data?.totalTrips);
    }

    getTotal();
  },[])

  // Handle "Total Cars" Card Click
  const handleCarClick = () => {
    // Open a new window with a specific size
    const newWindow = window.open("", "_blank", "width=600,height=400");

    // Write the content to the new window (HTML structure)
    newWindow.document.write(`
      <html>
        <head>
          <title>Car Status</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h2 {
              text-align: center;
            }
            .status {
              margin: 20px 0;
              padding: 15px;
              border-radius: 5px;
              background-color: #f9f9f9;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .status p {
              font-size: 18px;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <h2>Car Status</h2>
          <div class="status">
            <p><strong>Running Cabs:</strong> 15</p>
            <p><strong>Vacant Cabs:</strong> 5</p>
            <p><strong>Idle Cabs:</strong> 10</p>
          </div>
        </body>
      </html>
    `);

    // Close the document to render the content properly
    newWindow.document.close();
  };

  return (
    <div className="dashboard">
      <div className="dashboard__wrapper">
        <div className="dashboard__cards">
          {/* Single Card for Total Cars */}
          <SingleCard
            item={{ ...carObj, totalNumber: state.totalVehicles }}
            onClick={handleCarClick} // Add onClick handler to open the popup
          />
          <SingleCard item={{...tripObj, totalNumber: totalTrip}} />
          <SingleCard item={clientObj} />
          <SingleCard item={distanceObj} />
        </div>
        <div>
          <button className="tracking-btn">Tracking Cabs</button>
          
        </div>

          {/* <div className="statics">
            <div className="stats">
              <h3 className="stats__title">Miles Statistics</h3>
              <MileChart />
            </div>

            <div className="stats">
              <h3 className="stats__title">Car Statistics</h3>
              <CarStatsChart />
            </div>
          </div> */}

        {/* <div className="recommend__cars-wrapper">
          {recommendCarsData.map((item) => (
            <RecommendCarCard item={item} key={item.id} />
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;

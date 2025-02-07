import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import '../styles/styles.css';

const Home = () => {
  const [spots, setSpots] = useState([]);
  const { clientUID } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!clientUID) {
      console.error('No clientUID provided');
      return;
    }

    const fetchSpots = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/get-spots?clientUID=${clientUID}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch spots");
        }
        const data = await response.json();
    
        // Cross-reference spots with Sheet1 data to determine "completed" status
        const completedSpots = new Set(
          data.responses.map((response) => response.spotName) // Assuming Sheet1 responses are included in API
        );
    
        const updatedSpots = data.spots.map((spot) => ({
          ...spot,
          completed: completedSpots.has(spot.spotName), // Mark as completed if user has a response
        }));
    
        setSpots(updatedSpots);
      } catch (error) {
        console.error("Error fetching spots:", error.message);
      }
    };
    

    fetchSpots();
  }, [clientUID]);

  const handleClick = (spot) => {
    navigate('/ranking-form', {
      state: {
        spotName: spot.spotName,
        address: spot.address,
        description: spot.description,
        clientUID, // Include clientUID in the state
      },
    });
  };
  

  
  return (
    <div className="home-container">
      <h2 className="text-center">🍕 Pizza Scorecard 🍕</h2>
      <div className="progress-section">
      <h3>Your Progress</h3>
      <progress
      className="progress-bar"
      value={spots.filter((spot) => spot.completed).length} // Use the "completed" state
      max={spots.length}
      aria-label="User progress through pizza spots"
    ></progress>

    </div>

      <div className="location-grid">
      {spots.map((spot) => (
        <div
          key={spot.spotName}
          className={`spot-card ${spot.completed ? 'completed' : 'todo'}`}
        >
          <h4>{spot.spotName}</h4>
          <p>{spot.completed ? "✅ Completed" : "🕒 To Do"}</p>
          <button
            onClick={() =>
              navigate(`/ranking-form`, {
                state: {
                  spotName: spot.spotName,
                  address: spot.address, // Pass additional spot details if needed
                  description: spot.description, // Optional: pass more details
                  clientUID, // Include clientUID here
                },
              })
            }
          >
            {spot.completed ? "Update Rating" : "Start Rating"}
          </button>
        </div>
    ))}
      </div>
    </div>
  );
};

export default Home;
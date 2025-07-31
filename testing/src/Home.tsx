import React from 'react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="top-bar">
        <div className="search-box">
          <input type="text" placeholder="Search..." />
        </div>
        <div className="links">
          <a href="#">Link 1</a>
          <a href="#">Link 2</a>
        </div>
      </div>
      <div className="recs-container">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="rec">
            Recommendation {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

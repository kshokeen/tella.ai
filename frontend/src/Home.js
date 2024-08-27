import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Header from './Header';

const Home = () => {
  return (
    <div className="home">
    <Header />
      <div className="background-image">
        <Link to="/Game">
          <button>Play Game </button>
        </Link>
      </div>
      <div className="description">
        <p>tella.ai is an innovative online text adventure game that dynamically generates its story as you play, 
            powered by advanced AI. As you make choices and explore different paths, the AI crafts unique narratives 
            and scenarios in real-time, ensuring that each playthrough offers a new and personalized experience. 
            The game combines the charm of classic text adventures with the unpredictability of AI-driven storytelling, 
            allowing players to shape their own adventures in a world where anything can happen.</p>
      </div>
      <div className="columns">
        <div className="column">Info 1</div>
        <div className="column">Info 2</div>
        <div className="column">Info 3</div>
        <div className="column">Info 4</div>
      </div>
    </div>
  );
};

export default Home;
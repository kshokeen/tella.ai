import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './Game.css';

const key_env = 'AIzaSyDJAKC5gmzJB2ZyQnleURhA0RyILG1n-S4';
const genAI = new GoogleGenerativeAI(key_env);

async function sendApiCall(setting, character) {
  console.log('Google AI request:', setting, character);
  const prompt = `Setting: ${setting}, Character: ${character}. Start the story.`;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    console.log('Google AI response:', prompt, ' resp:', responseText);
    return responseText;
  } catch (error) {
    console.error('Error fetching data from Google AI:', error);
    return 'An error occurred while fetching the story.';
  }
}

const Game = () => {
  const [step, setStep] = useState(1);
  const [setting, setSetting] = useState('');
  const [character, setCharacter] = useState('');
  const [story, setStory] = useState('');
  const [error, setError] = useState('');

  const handleSettingSelect = (selectedSetting) => {
    setSetting(selectedSetting);
    setStep(2);
  };

  const handleCharacterSelect = async (selectedCharacter) => {
    setCharacter(selectedCharacter);
  
    if (!setting) {
      setError('Please select a setting first.');
      return;
    }
  
    try {
      const response = await sendApiCall(setting, character);
      setStory(response);
      setStep(3);
    } catch (error) {
      if (error.status === 429) {
        setError('You exceeded your current quota. Please check your plan and billing details.');
        console.error('Error fetching data from Google AI:', error);
      } else {
        setError('An error occurred while fetching data from Google AI.');
        console.error('Error fetching data from Google AI:', error);
      }
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const action = event.target.action.value;
    const instruction = event.target.instruction.value;
  
    if (instruction.trim() === '') {
      setError('Please enter an instruction.');
      return;
    }
  
    const playerText = `${action.toUpperCase()}: ${instruction}`;
    const newStory = `${story}\n${playerText}`;
    setStory(newStory);
  
    try {
      const response = await fetch('https://api.gemini.com/continue-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, instruction }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to continue the story');
      }
  
      const data = await response.json();
      setStory((prevStory) => `${prevStory}\n${data.continuation}`);
    } catch (error) {
      setError('An error occurred while continuing the story.');
      console.error('Error continuing the story:', error);
    }
  
    event.target.reset();
  };

  return (
    <div className="game-container">
      {error && <div className="error">{error}</div>}

      {step === 1 && (
        <div className="selection-screen">
          <h1>What is your preferred setting?</h1>
          <ul>
            <li onClick={() => handleSettingSelect('Fantasy')}>Fantasy</li>
            <li onClick={() => handleSettingSelect('Mystery')}>Mystery</li>
            <li onClick={() => handleSettingSelect('Post-Apocalyptic')}>Post-Apocalyptic</li>
            <li onClick={() => handleSettingSelect('Supernatural')}>Supernatural</li>
            <li onClick={() => handleSettingSelect('Sci-Fi')}>Sci-Fi</li>
          </ul>
        </div>
      )}
      {step === 2 && (
        <div className="selection-screen">
          <h1>What character do you choose?</h1>
          <ul>
            <li onClick={() => handleCharacterSelect('Warrior')}>Warrior</li>
            <li onClick={() => handleCharacterSelect('Mage')}>Mage</li>
            <li onClick={() => handleCharacterSelect('Rogue')}>Rogue</li>
          </ul>
        </div>
      )}
      {step === 3 && (
        <div className="story-screen">
        <h1>Your Adventure Begins</h1>
        <p>{story}</p>
        <form onSubmit={handleSubmit} className="action-bar">
          <select name="action" className="action-dropdown">
            <option value="do">Do</option>
            <option value="see">See</option>
            <option value="move">Move</option>
            <option value="story">Story</option>
          </select>
          <input
            type="text"
            name="instruction"
            className="instruction-input"
            maxLength="150"
            placeholder="Enter your instruction"
          />
          <button type="submit" className="submit-button">Submit</button>
        </form>
      </div>
      )}
    </div>
  );
};

export default Game;
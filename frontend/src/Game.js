import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './Game.css';

const key_env = 'AIzaSyDJAKC5gmzJB2ZyQnleURhA0RyILG1n-S4'; 
const genAI = new GoogleGenerativeAI(key_env);

//API call only for the start of the story
async function storyApiCall(setting, character, storyNote) {
  console.log('Google AI request:', setting, character, storyNote);
  const prompt = `Setting: ${setting}, Character: ${character}, Starting instructions: ${storyNote}.`;
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

// API call needed to be used for the rest of the Game
// it need to send the action and text, and the story needs to be remembered
async function playerApiCall(instruction, note) {
  console.log('Google AI request:', instruction, note);
  const prompt = `instruction: ${instruction}, note: ${note}.`;
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
  // const [action, setAction] = useState('');
  const [instruction, setInstruction] = useState('');
  const [accumulatedStory, setAccumulatedStory] = useState('');
  const [story, setStory] = useState('');
  const [error, setError] = useState('');
  const note = 'Can you continue creating a text baised adventure game. The instruction are what the player decides to do next. If you are missign any info, you can make it up as you see fit, just make sure it follows and fits in the story.';
  const storyNote = 'Create a captivating opening scene for a second-person text adventure. Introduce the player as a [character] in a [setting] world. Provide a brief description of their surroundings, possessions, and a compelling reason for their presence there. Keep the text concise and engaging.';

  const handleSettingSelect = (selectedSetting) => {
    setSetting(selectedSetting);
    setStep(2);
  };

  const handleCharacterSelect = async (selectedCharacter) => {
    setCharacter(selectedCharacter);
    
    if (!character) {
      //setError('Please select a setting first.');
      return;
    }
  
    try {
      const response = await storyApiCall(setting, character, storyNote);
      setStory(response);
      setAccumulatedStory(response); 
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
    const instruction = event.target.instruction.value;
  
    if (instruction.trim() === '') {
      setError('Please enter an instruction.');
      return;
    }
  
    try {
      const response = await playerApiCall(accumulatedStory, instruction);
      setStory(response);
      setAccumulatedStory(prev => `${prev}\n${instruction}\n${response}`);
      setInstruction('');
    } catch (error) {
      console.error('Error fetching data from Google AI:', error);
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
          <input
            type="text"
            name="instruction"
            className="instruction-input"
            maxLength="150"
            placeholder="Enter your instruction"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
          <button type="submit" className="submit-button">Submit</button>
        </form>
      </div>
      )}
    </div>
  );
};

export default Game;
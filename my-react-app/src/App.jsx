import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // Assuming App.css contains your original styles

const App = () => {
  // Game states
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(240); // Initial time set to 240 seconds
  const [isPaused, setIsPaused] = useState(false); // State to manage pause functionality
  // Removed: const [isPuppyJumping, setIsPuppyJumping] = useState(false); // State for puppy jump animation

  // User name states
  const [userName, setUserName] = useState('');
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);

  // Ref for game area to determine its dimensions
  const gameAreaRef = useRef(null);
  const audioRef = useRef(null); // Ref for the audio element

  // Array of audio sources for random selection
  // IMPORTANT: Replace these placeholder paths with the actual paths to your audio files.
  const audioSources = [
    "/music1.mp3",
    "/music2.mp3",
    "/music3.mp3",
    "/music4.mp3",
  ];

  // State to hold the currently selected audio source
  const [currentAudioSrc, setCurrentAudioSrc] = useState('');

  // --- Leaderboard Logic ---

  // Load leaderboard from localStorage on component mount
  useEffect(() => {
    try {
      const storedLeaderboard = JSON.parse(localStorage.getItem('bubblePopLeaderboard')) || [];
      setLeaderboard(storedLeaderboard);
    } catch (error) {
      console.error("Failed to load leaderboard from localStorage:", error);
      setLeaderboard([]); // Reset on error to prevent app crash
    }
  }, []); // Empty dependency array means this runs once on initial mount

  // Function to add a new score to the leaderboard
  const addScoreToLeaderboard = (name, finalScore) => {
    // Create a new entry with a unique ID
    const newEntry = { name, score: finalScore, id: Date.now() };
    // Add the new entry, sort by score (descending), and keep only the top 10
    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(updatedLeaderboard);
    // Save the updated leaderboard to localStorage
    localStorage.setItem('bubblePopLeaderboard', JSON.stringify(updatedLeaderboard));
  };

  // --- Game Logic ---

  // Function to generate a new bubble
  const generateBubble = () => {
    // Do not generate bubbles if the game is over or paused
    if (gameOver || isPaused) return;

    // Get game area dimensions, default to window size if ref is not yet available
    const gameAreaWidth = gameAreaRef.current ? gameAreaRef.current.clientWidth : window.innerWidth;
    const gameAreaHeight = gameAreaRef.current ? gameAreaRef.current.clientHeight : window.innerHeight;

    // Create a new bubble object with random properties
    const newBubble = {
      id: Date.now() + Math.random(), // Unique ID for React keys
      x: Math.random() * (gameAreaWidth - 70), // Random horizontal position
      y: gameAreaHeight, // Start at the bottom
      size: Math.random() * 65 + 65, // Random size between 65 and 130
      speed: Math.random() * 10 + 15, // Random speed between 15 and 25
    };
    setBubbles((prevBubbles) => [...prevBubbles, newBubble]);
  };

  // Function to move existing bubbles upwards
  const moveBubbles = () => {
    // Do not move bubbles if the game is over or paused
    if (gameOver || isPaused) return;

    setBubbles((prevBubbles) => {
      // Update each bubble's vertical position
      const updatedBubbles = prevBubbles
        .map((bubble) => ({
          ...bubble,
          y: bubble.y - bubble.speed,
        }))
        // Filter out bubbles that have moved off the top of the screen
        .filter((bubble) => bubble.y > -bubble.size);

      return updatedBubbles;
    });
  };

  // Handle bubble click event - now directly pops the bubble
  const handleClick = (id) => {
    // Do not allow clicks if the game is over or paused
    if (gameOver || isPaused) return;

    // Directly remove the clicked bubble and increment the score
    setBubbles((prevBubbles) => prevBubbles.filter((bubble) => bubble.id !== id));
    setScore((prevScore) => prevScore + 1);
  };

  // --- Timer Logic ---
  useEffect(() => {
    // This useEffect manages the game timer.
    // It only runs if the name has been submitted AND the game is not over AND not paused.
    if (!isNameSubmitted || gameOver || isPaused) {
      // If the game is over and a name was submitted, add the score to the leaderboard.
      // This ensures the score is saved only once at the end of the game.
      if (gameOver && isNameSubmitted && userName.trim() !== '') {
        addScoreToLeaderboard(userName, score);
      }
      return; // Stop the timer if conditions are not met
    }

    // If time runs out, set game over
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }

    // Set up a new interval to decrement timeLeft every second
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Clean up the interval when the component unmounts or dependencies change
    return () => clearInterval(timerInterval);
  }, [timeLeft, gameOver, isNameSubmitted, userName, score, isPaused]); // Added isPaused dependency

  // --- Game Loop: Generate and Move bubbles ---
  useEffect(() => {
    // This useEffect controls the continuous generation and movement of bubbles.
    // It only starts if the game is not over AND the name has been submitted AND not paused.
    if (gameOver || !isNameSubmitted || isPaused) return;

    // Set intervals for generating new bubbles and moving existing ones
    const generateInterval = setInterval(generateBubble, 1100); // Generate a bubble every 1.1 seconds
    const moveInterval = setInterval(moveBubbles, 50); // Move bubbles every 50 milliseconds

    // Clean up intervals when the component unmounts or dependencies change
    return () => {
      clearInterval(generateInterval);
      clearInterval(moveInterval);
    };
  }, [gameOver, isNameSubmitted, isPaused]); // Added isPaused dependency

  // --- Audio Playback Logic ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return; // Ensure audio element exists

    // Load the new audio source when it changes
    if (currentAudioSrc) {
      audio.src = currentAudioSrc;
      audio.load(); // Load the new audio
    }

    if (isNameSubmitted && !gameOver && !isPaused) {
      // Play music when game starts (name submitted) and is not paused/over
      audio.play().catch(error => console.error("Audio play failed:", error));
    } else if (gameOver || isPaused) {
      // Pause music when game is over or paused
      audio.pause();
    }

    // Clean up function: pause audio when component unmounts or dependencies change
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0; // Reset audio to start for next game
      }
    };
  }, [isNameSubmitted, gameOver, isPaused, currentAudioSrc]); // Added currentAudioSrc dependency

  // Removed: --- Puppy Jump Collision Detection Logic ---
  // Removed: useEffect(() => { ... }, [isPuppyJumping, gameOver, isPaused, bubbles.length]);

  // --- Name Submission Logic ---
  const handleNameChange = (event) => {
    setUserName(event.target.value);
  };

  const handleSubmitName = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    if (userName.trim() !== '') {
      setIsNameSubmitted(true); // Set name submitted to true to start the game
      // Select a random audio source when the game starts
      const randomIndex = Math.floor(Math.random() * audioSources.length);
      setCurrentAudioSrc(audioSources[randomIndex]);
    } else {
      alert('Please enter your name!'); // Retained alert() as per user's original code
    }
  };

  // Function to toggle pause state
  const togglePause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  // Function to reset game
  const resetGame = () => {
    setBubbles([]); // Clear all bubbles
    setScore(0); // Reset score
    setGameOver(false); // Set game over to false
    setTimeLeft(240); // Reset timer to initial value (240s)
    setUserName(''); // Clear user name
    setIsNameSubmitted(false); // Reset name submission status
    setIsPaused(false); // Reset pause state
    // Removed: setIsPuppyJumping(false); // Reset puppy jump state
    setCurrentAudioSrc(''); // Clear current audio source on reset
    // Audio will be handled by useEffect when isNameSubmitted becomes false
  };

  // --- Render Logic ---
  return (
    <div className="game-container text-black" ref={gameAreaRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '16px' }}>
      {/* Audio element for background music */}
      {/* The src will be set dynamically by the useEffect hook */}
      <audio ref={audioRef} loop preload="auto" />

      {/* Conditionally render name prompt or game */}
      {!isNameSubmitted ? (
        <div className="name-prompt" style={{ textAlign: 'center', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h2 className = "mb-3">For Aveer and Meher :D</h2>
          <form onSubmit={handleSubmitName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              value={userName}
              onChange={handleNameChange}
              placeholder="Your Name"
              aria-label="Your name"
              disabled={gameOver} // Disable input if game is over
              style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button type="submit" disabled={gameOver} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
              Start Game
            </button>
          </form>
          {leaderboard.length > 0 && (
            <div className="leaderboard-section" style={{ marginTop: '20px' }}>
              <h3 className = "font-bold">High Scores!</h3>
              <ol style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
                {leaderboard.map((entry, index) => (
                  <li key={entry.id || index} style={{ padding: '2px 0' }}> {/* Use entry.id for better keying */}
                    {entry.name}: {entry.score}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ) : (
        <>
          <h1>Aveer and Meher's Bubble Pop Game</h1>
          <div className="timer">Time Left: {timeLeft}s</div>

          {gameOver && (
            <div className="game-over" style={{ textAlign: 'center', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginTop: '20px' }}>
              ⌚ Time's Up! Final Score: {score}
              <button onClick={resetGame} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer', marginTop: '10px' }}>Play Again?</button>
              {/* Display leaderboard after game over */}
              {leaderboard.length > 0 && (
                <div className="leaderboard-section" style={{ marginTop: '20px' }}>
                  <h3>Leaderboard</h3>
                  <ol style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
                    {leaderboard.map((entry, index) => (
                      <li key={entry.id || index} style={{ padding: '2px 0' }}>
                        {entry.name}: {entry.score}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
          <div className="score">Score: {score}</div>
          {/* Pause/Resume Button */}
          <button
            onClick={togglePause}
            disabled={gameOver} // Disable if game is over
            style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#ffc107', color: 'black', cursor: 'pointer', marginTop: '10px', marginBottom: '10px' }}
          >
            {isPaused ? 'Resume Game' : 'Pause Game'}
          </button>

          <div className="game-area" style={{ position: 'relative', width: '100%', height: 'calc(100vh - 150px)', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.05)' }}>
            {/* Render bubbles */}
            {bubbles.map((bubble) => (
              <div
                key={bubble.id}
                onClick={() => handleClick(bubble.id)} // onClick now directly pops the bubble
                className="bubble"
                style={{
                  left: `${bubble.x}px`,
                  top: `${bubble.y}px`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  borderRadius: '50%',
                  backgroundColor: 'skyblue',
                  position: 'absolute',
                  cursor: 'pointer', // Keep cursor pointer to indicate clickability
                }}
              />
            ))}
            {/* Removed: Puppy image at the bottom */}
            {/* Removed: <img src="/puppy.png" alt="puppy" className="puppy-at-bottom" style={{ ... }} /> */}

            {/* Paused overlay */}
            {isPaused && !gameOver && (
              <div className="paused-overlay" style={{ position: 'absolute', inset: '0', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3em', fontWeight: 'bold', color: 'white', borderRadius: '20px', zIndex: '15' }}>
                PAUSED
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
//hello :>
export default App;

/**
 * Game Over Screen Component
 * Shows final score and options to restart or return to menu
 */

import type { Difficulty } from '../../types/index.ts';
import { Button } from '../UI/Button.tsx';
import { getDifficultyName, getDifficultyColor } from '../../utils/helpers.ts';
import { useEffect, useState } from 'react';

interface GameOverProps {
  score: number;
  highScore: number;
  fishCaught: number;
  totalFish: number;
  timeRemaining: number;
  difficulty: Difficulty;
  onRestart: () => void;
  onMainMenu: () => void;
}

/**
 * Game over screen
 */
export function GameOver({
  score,
  highScore,
  fishCaught,
  totalFish,
  timeRemaining,
  difficulty,
  onRestart,
  onMainMenu,
}: GameOverProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const isNewHighScore = score >= highScore && score > 0;
  const allCaught = fishCaught >= totalFish;

  // Animate score counting up
  useEffect(() => {
    const duration = 1500; // ms
    const startTime = Date.now();
    const startScore = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startScore + (score - startScore) * eased);

      setAnimatedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, rgba(10, 22, 40, 0.95) 0%, rgba(26, 58, 92, 0.95) 100%)',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    zIndex: 100,
    animation: 'fadeIn 0.5s ease',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: allCaught ? '48px' : '42px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textShadow: allCaught
      ? '0 0 20px rgba(68, 255, 68, 0.5)'
      : '0 0 20px rgba(255, 68, 68, 0.5)',
    color: allCaught ? '#44ff44' : '#ff6666',
  };

  const boxStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '16px',
    padding: '30px 40px',
    minWidth: '350px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
  };

  const scoreStyle: React.CSSProperties = {
    fontSize: '72px',
    fontWeight: 'bold',
    background: 'linear-gradient(180deg, #ffd700 0%, #ffaa00 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '10px',
  };

  const statsRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>
        {allCaught ? 'VICTORY!' : 'GAME OVER'}
      </h1>

      {allCaught && timeRemaining > 0 && (
        <p style={{ marginBottom: '20px', opacity: 0.8 }}>
          You caught all the fish with {Math.floor(timeRemaining)}s to spare!
        </p>
      )}

      <div style={boxStyle}>
        {/* New High Score Banner */}
        {isNewHighScore && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.2), rgba(255, 170, 0, 0.2))',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffd700',
          }}>
            <span style={{ fontSize: '20px' }}>New High Score!</span>
          </div>
        )}

        {/* Score Display */}
        <div>
          <p style={{ opacity: 0.7, marginBottom: '5px' }}>Final Score</p>
          <p style={scoreStyle}>{animatedScore.toLocaleString()}</p>
        </div>

        {/* Stats */}
        <div style={{ margin: '20px 0' }}>
          <div style={statsRowStyle}>
            <span style={{ opacity: 0.7 }}>Fish Caught</span>
            <span style={{ fontWeight: 'bold', color: '#4ecdc4' }}>
              {fishCaught} / {totalFish}
            </span>
          </div>
          <div style={statsRowStyle}>
            <span style={{ opacity: 0.7 }}>Difficulty</span>
            <span style={{ fontWeight: 'bold', color: getDifficultyColor(difficulty) }}>
              {getDifficultyName(difficulty)}
            </span>
          </div>
          <div style={statsRowStyle}>
            <span style={{ opacity: 0.7 }}>Time Remaining</span>
            <span style={{ fontWeight: 'bold' }}>
              {Math.floor(timeRemaining)}s
            </span>
          </div>
          <div style={{ ...statsRowStyle, borderBottom: 'none' }}>
            <span style={{ opacity: 0.7 }}>High Score</span>
            <span style={{ fontWeight: 'bold', color: '#ffd700' }}>
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div style={{
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <p style={{ marginBottom: '5px', opacity: 0.7 }}>Rating</p>
          <p style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: getRatingColor(fishCaught, totalFish, timeRemaining),
            textShadow: `0 0 20px ${getRatingColor(fishCaught, totalFish, timeRemaining)}`,
            animation: getRating(fishCaught, totalFish, timeRemaining) === 'S' ? 'ratingPulse 1s ease infinite' : 'none',
          }}>
            {getRating(fishCaught, totalFish, timeRemaining)}
          </p>
          <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '5px' }}>
            {getRatingMessage(fishCaught, totalFish, timeRemaining)}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={onRestart} fullWidth>
            Play Again
          </Button>
          <Button onClick={onMainMenu} variant="secondary" fullWidth>
            Main Menu
          </Button>
        </div>
      </div>

      {/* Tip */}
      <p style={{
        marginTop: '20px',
        opacity: 0.5,
        fontSize: '14px',
      }}>
        Press Enter or Space to play again
      </p>

      {/* CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ratingPulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.1); filter: brightness(1.3); }
        }
      `}</style>
    </div>
  );
}

/**
 * Calculate rating based on performance
 */
function getRating(fishCaught: number, totalFish: number, timeRemaining: number): string {
  const catchRatio = fishCaught / totalFish;

  if (catchRatio >= 1 && timeRemaining > 30) return 'S';
  if (catchRatio >= 1) return 'A';
  if (catchRatio >= 0.8) return 'B';
  if (catchRatio >= 0.6) return 'C';
  if (catchRatio >= 0.4) return 'D';
  return 'F';
}

/**
 * Get color for rating
 */
function getRatingColor(fishCaught: number, totalFish: number, timeRemaining: number): string {
  const rating = getRating(fishCaught, totalFish, timeRemaining);
  const colors: Record<string, string> = {
    'S': '#ffd700',
    'A': '#44ff44',
    'B': '#4ecdc4',
    'C': '#ffaa00',
    'D': '#ff8844',
    'F': '#ff4444',
  };
  return colors[rating] || '#ffffff';
}

/**
 * Get encouraging message for rating
 */
function getRatingMessage(fishCaught: number, totalFish: number, timeRemaining: number): string {
  const rating = getRating(fishCaught, totalFish, timeRemaining);
  const messages: Record<string, string> = {
    'S': 'Perfect! You are a Marco Polo master!',
    'A': 'Excellent! You caught them all!',
    'B': 'Great job! Almost got them all!',
    'C': 'Good effort! Keep practicing!',
    'D': 'Not bad! Try using Marco calls wisely.',
    'F': 'Keep trying! Listen for the Polo!',
  };
  return messages[rating] || '';
}

export default GameOver;

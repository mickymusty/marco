import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Game3D } from './components/Three/Game3D.tsx';
import type { Difficulty } from './types/threeGame.ts';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameKey, setGameKey] = useState(0);

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setGameKey((prev) => prev + 1);
  };

  const pageStyle: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    gap: '20px',
    background: 'radial-gradient(circle at 50% 30%, #0a0a25, #000010)',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const titleStyle: CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: '#ffff00',
    textShadow: '0 0 20px rgba(255, 255, 0, 0.5)',
    letterSpacing: '0.05em',
  };

  const difficultyContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '8px',
  };

  const buttonBase: CSSProperties = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '2px solid',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  };

  const getButtonStyle = (level: Difficulty): CSSProperties => {
    const isActive = difficulty === level;
    const colors = {
      easy: { bg: '#22cc66', border: '#22cc66', text: '#000' },
      medium: { bg: '#ffaa00', border: '#ffaa00', text: '#000' },
      hard: { bg: '#ff4444', border: '#ff4444', text: '#fff' },
    };
    const c = colors[level];

    return {
      ...buttonBase,
      background: isActive ? c.bg : 'transparent',
      borderColor: c.border,
      color: isActive ? c.text : c.border,
      boxShadow: isActive ? `0 0 20px ${c.bg}66` : 'none',
    };
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>PAC-MAN 3D</div>
        <div style={difficultyContainerStyle}>
          <button
            type="button"
            style={getButtonStyle('easy')}
            onClick={() => handleDifficultyChange('easy')}
          >
            EASY
          </button>
          <button
            type="button"
            style={getButtonStyle('medium')}
            onClick={() => handleDifficultyChange('medium')}
          >
            MEDIUM
          </button>
          <button
            type="button"
            style={getButtonStyle('hard')}
            onClick={() => handleDifficultyChange('hard')}
          >
            HARD
          </button>
        </div>
      </div>
      <Game3D key={gameKey} difficulty={difficulty} />
    </div>
  );
}

export default App;

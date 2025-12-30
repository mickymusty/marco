import type { CSSProperties } from 'react';
import type { GameStatus } from '../../types/threeGame.ts';

interface GameOverlayProps {
  score: number;
  highScore: number;
  lives: number;
  level: number;
  totalPellets: number;
  pelletsEaten: number;
  gameStatus: GameStatus;
  isPoweredUp: boolean;
  onStart: () => void;
  onReset: () => void;
}

export function GameOverlay({
  score,
  highScore,
  lives,
  level,
  totalPellets,
  pelletsEaten,
  gameStatus,
  isPoweredUp,
  onStart,
  onReset,
}: GameOverlayProps) {
  const progress = totalPellets > 0 ? Math.min(100, (pelletsEaten / totalPellets) * 100) : 0;
  const isGameOver = gameStatus === 'lost';
  const isReady = gameStatus === 'ready';

  const panelStyle: CSSProperties = {
    background: isGameOver
      ? 'linear-gradient(135deg, rgba(80, 20, 20, 0.95), rgba(60, 15, 15, 0.9))'
      : isPoweredUp
        ? 'linear-gradient(135deg, rgba(40, 40, 80, 0.95), rgba(30, 30, 100, 0.9))'
        : 'linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(20, 20, 50, 0.9))',
    border: `2px solid ${isGameOver ? '#ff4444' : isPoweredUp ? '#4444ff' : '#ffff00'}`,
    borderRadius: '16px',
    padding: '16px 24px',
    backdropFilter: 'blur(12px)',
    width: '100%',
    maxWidth: '700px',
    boxShadow: `0 0 30px ${isGameOver ? 'rgba(255, 0, 0, 0.3)' : isPoweredUp ? 'rgba(0, 0, 255, 0.4)' : 'rgba(255, 255, 0, 0.2)'}`,
  };

  const labelStyle: CSSProperties = {
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '4px',
  };

  const valueStyle: CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: 'monospace, sans-serif',
  };

  // Ready screen
  if (isReady) {
    return (
      <div style={panelStyle}>
        <div
          style={{
            textAlign: 'center',
            padding: '20px 0',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#ffff00',
              textShadow: '0 0 20px rgba(255, 255, 0, 0.6)',
              marginBottom: '16px',
            }}
          >
            PAC-MAN 3D
          </div>
          <div
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '20px',
            }}
          >
            Eat all pellets! Avoid ghosts! Power pellets let you eat ghosts!
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}>
              WASD / Arrows: Move
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(255,255,0,0.2)', borderRadius: '8px', fontSize: '12px', color: '#ffff00' }}>
              Pellets: +10pts
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(255,170,0,0.2)', borderRadius: '8px', fontSize: '12px', color: '#ffaa00' }}>
              Power Pellets: +50pts
            </div>
          </div>
          <button
            type="button"
            onClick={onStart}
            style={{
              padding: '14px 32px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #ffff00, #ffcc00)',
              color: '#000',
              fontWeight: 700,
              fontSize: '18px',
              boxShadow: '0 8px 30px rgba(255, 255, 0, 0.4)',
            }}
          >
            START GAME
          </button>
          {highScore > 0 && (
            <div style={{ marginTop: '16px', fontSize: '14px', color: '#ffaa00' }}>
              High Score: {highScore.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game over screen
  if (isGameOver) {
    return (
      <div style={panelStyle}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#ff4444',
              textShadow: '0 0 20px rgba(255, 0, 0, 0.5)',
              marginBottom: '12px',
            }}
          >
            GAME OVER
          </div>
          <div style={{ fontSize: '18px', color: '#ffff00', marginBottom: '8px' }}>
            Final Score: {score.toLocaleString()}
          </div>
          {score >= highScore && score > 0 && (
            <div style={{ fontSize: '14px', color: '#4ecdc4', marginBottom: '12px' }}>
              NEW HIGH SCORE!
            </div>
          )}
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
            Level {level} - {pelletsEaten} pellets collected
          </div>
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a5a)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '16px',
              boxShadow: '0 6px 24px rgba(255, 100, 100, 0.4)',
            }}
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // In-game HUD
  return (
    <div style={panelStyle}>
      {isPoweredUp && (
        <div
          style={{
            textAlign: 'center',
            padding: '6px 0 10px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#4444ff',
            textShadow: '0 0 15px rgba(100, 100, 255, 0.8)',
          }}
        >
          POWER MODE ACTIVE!
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        {/* Score */}
        <div style={{ flex: 1, minWidth: '100px' }}>
          <div style={labelStyle}>Score</div>
          <div style={{ ...valueStyle, color: '#ffff00', textShadow: '0 0 10px rgba(255, 255, 0, 0.5)' }}>
            {score.toLocaleString()}
          </div>
        </div>

        {/* High Score */}
        <div style={{ flex: 1, minWidth: '100px' }}>
          <div style={labelStyle}>High Score</div>
          <div style={{ ...valueStyle, fontSize: '20px', color: '#ffaa00' }}>
            {highScore.toLocaleString()}
          </div>
        </div>

        {/* Level */}
        <div style={{ flex: 0.5, minWidth: '60px' }}>
          <div style={labelStyle}>Level</div>
          <div style={{ ...valueStyle, color: '#4ecdc4' }}>{level}</div>
        </div>

        {/* Lives */}
        <div style={{ flex: 1, minWidth: '100px' }}>
          <div style={labelStyle}>Lives</div>
          <div style={{ fontSize: '24px' }}>
            {Array.from({ length: lives }).map((_, i) => (
              <span key={i} style={{ marginRight: '4px' }}>🟡</span>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ flex: 1.5, minWidth: '150px' }}>
          <div style={labelStyle}>Pellets {pelletsEaten}/{totalPellets}</div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              height: '12px',
              borderRadius: '999px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 0, 0.3)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #ffff00, #ffcc00)',
                transition: 'width 0.2s ease',
                boxShadow: '0 0 10px rgba(255, 255, 0, 0.5)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameOverlay;

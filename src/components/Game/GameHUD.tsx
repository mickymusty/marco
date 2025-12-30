/**
 * Game HUD Component
 * Displays score, time, and other game information
 */

import { formatTime } from '../../utils/helpers.ts';

interface GameHUDProps {
  score: number;
  timeRemaining: number;
  fishCaught: number;
  totalFish: number;
  marcoCallsRemaining: number;
  maxMarcoCalls: number;
  canCallMarco: boolean;
  cooldownProgress: number;
  comboCount: number;
}

/**
 * Game heads-up display
 */
export function GameHUD({
  score,
  timeRemaining,
  fishCaught,
  totalFish,
  marcoCallsRemaining,
  maxMarcoCalls,
  canCallMarco,
  cooldownProgress,
  comboCount,
}: GameHUDProps) {
  const hudStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '10px 20px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    width: '100%',
    maxWidth: '800px',
  };

  const panelStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '8px',
    padding: '10px 15px',
    backdropFilter: 'blur(5px)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    opacity: 0.7,
    marginBottom: '2px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
  };

  const isLowTime = timeRemaining <= 15;
  const isVeryLowTime = timeRemaining <= 5;

  return (
    <div style={hudStyle}>
      {/* Left Panel - Score */}
      <div style={panelStyle}>
        <div style={labelStyle}>Score</div>
        <div style={{
          ...valueStyle,
          color: '#ffd700',
        }}>
          {score.toLocaleString()}
        </div>
        {comboCount > 1 && (
          <div style={{
            fontSize: '14px',
            color: '#ff6b6b',
            animation: 'pulse 0.5s ease infinite',
          }}>
            {comboCount}x COMBO!
          </div>
        )}
      </div>

      {/* Center Panel - Fish Counter */}
      <div style={{ ...panelStyle, textAlign: 'center' }}>
        <div style={labelStyle}>Fish Caught</div>
        <div style={valueStyle}>
          <span style={{ color: '#4ecdc4' }}>{fishCaught}</span>
          <span style={{ opacity: 0.5, fontSize: '18px' }}> / {totalFish}</span>
        </div>

        {/* Fish progress bar */}
        <div style={{
          width: '120px',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
          marginTop: '5px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${(fishCaught / totalFish) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4ecdc4, #45b7d1)',
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Right Panel - Timer & Marco */}
      <div style={{ ...panelStyle, textAlign: 'right' }}>
        {/* Timer */}
        <div style={labelStyle}>Time</div>
        <div style={{
          ...valueStyle,
          color: isVeryLowTime ? '#ff4444' : isLowTime ? '#ffaa00' : '#ffffff',
          animation: isVeryLowTime ? 'pulse 0.5s ease infinite' : 'none',
        }}>
          {formatTime(timeRemaining)}
        </div>

        {/* Marco Calls */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ ...labelStyle, fontSize: '11px' }}>Marco Calls</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '3px' }}>
            {[...Array(maxMarcoCalls)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: i < marcoCallsRemaining
                    ? '#ffd700'
                    : 'rgba(255, 255, 255, 0.2)',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Cooldown indicator */}
          {!canCallMarco && marcoCallsRemaining > 0 && (
            <div style={{
              marginTop: '5px',
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(1 - cooldownProgress) * 100}%`,
                height: '100%',
                background: '#ffd700',
                borderRadius: '2px',
                transition: 'width 0.1s linear',
              }} />
            </div>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact HUD for bottom of screen
 */
export function GameHUDBottom() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '10px',
      fontFamily: 'Arial, sans-serif',
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '12px',
    }}>
      <span>WASD / Arrows: Move</span>
      <span style={{ margin: '0 15px' }}>|</span>
      <span>Space: Marco!</span>
      <span style={{ margin: '0 15px' }}>|</span>
      <span>ESC: Pause</span>
    </div>
  );
}

export default GameHUD;

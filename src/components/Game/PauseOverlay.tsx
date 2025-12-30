/**
 * Pause Overlay Component
 * Displayed when game is paused
 */

import { Button } from '../UI/Button.tsx';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

/**
 * Pause menu overlay
 */
export function PauseOverlay({ onResume, onRestart, onMainMenu }: PauseOverlayProps) {
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(10, 22, 40, 0.9)',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    zIndex: 100,
    animation: 'fadeIn 0.2s ease',
  };

  const boxStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '16px',
    padding: '30px 40px',
    minWidth: '300px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#ffd700',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <h2 style={titleStyle}>PAUSED</h2>

        <div style={buttonContainerStyle}>
          <Button onClick={onResume} fullWidth size="large">
            Resume
          </Button>

          <Button onClick={onRestart} variant="secondary" fullWidth>
            Restart
          </Button>

          <Button onClick={onMainMenu} variant="secondary" fullWidth>
            Main Menu
          </Button>
        </div>

        {/* Controls reminder */}
        <div style={{
          marginTop: '25px',
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          fontSize: '14px',
          opacity: 0.8,
        }}>
          <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Controls</p>
          <p>Move: WASD / Arrow Keys</p>
          <p>Marco Call: Space</p>
          <p>Pause: Escape / P</p>
        </div>
      </div>

      <p style={{
        marginTop: '20px',
        opacity: 0.5,
        fontSize: '14px',
      }}>
        Press Escape to resume
      </p>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default PauseOverlay;

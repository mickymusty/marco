import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { GameLogic } from './GameLogic.tsx';
import { SceneLights } from './SceneLights.tsx';
import { WaterSurface } from './WaterSurface.tsx';
import { Pacman } from './Pacman.tsx';
import { Pellet } from './Pellet.tsx';
import { PowerPellet } from './PowerPellet.tsx';
import { Ghost } from './Ghost.tsx';
import { GameOverlay } from './GameOverlay.tsx';
import { CameraRig } from './CameraRig.tsx';
import { useKeyboard } from '../../hooks/useKeyboard.ts';
import { usePacmanGame } from '../../hooks/usePacmanGame.ts';
import type { CSSProperties } from 'react';
import type { Difficulty } from '../../types/threeGame.ts';

interface Game3DProps {
  difficulty?: Difficulty;
}

export function Game3D({ difficulty = 'medium' }: Game3DProps) {
  const { keys } = useKeyboard(true);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const {
    pacman,
    pellets,
    pelletsRef,
    powerPellets,
    powerPelletsRef,
    ghosts,
    ghostsRef,
    score,
    highScore,
    lives,
    level,
    gameStatus,
    totalPellets,
    totalEaten,
    worldBounds,
    startGame,
    resetGame,
    handlePelletEaten,
    handlePowerPelletEaten,
    handleGhostEaten,
    handlePlayerHit,
  } = usePacmanGame(difficulty);

  const handleStart = () => {
    setGameStartTime(Date.now());
    startGame();
  };

  const handleReset = () => {
    setGameStartTime(Date.now());
    resetGame();
  };

  const containerStyle: CSSProperties = {
    width: '100%',
    maxWidth: '1400px',
  };

  const canvasShell: CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 0 60px rgba(255, 255, 0, 0.15), 0 20px 80px rgba(0, 0, 0, 0.5)',
    border: '2px solid rgba(255, 255, 0, 0.2)',
    background: '#000010',
  };

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    left: '0',
    bottom: '0',
    width: '100%',
    padding: '16px',
    pointerEvents: 'none',
  };

  const boundarySize = Math.max(worldBounds.x, worldBounds.z);

  return (
    <div style={containerStyle}>
      <div style={canvasShell}>
        <Canvas shadows camera={{ position: [0, 25, 30], fov: 50, near: 0.1, far: 200 }}>
          <Suspense fallback={null}>
            <color attach="background" args={['#000015']} />
            <fog attach="fog" args={['#000015', 20, 80]} />
            <SceneLights />
            <CameraRig target={pacman.current} />

            {/* Arena floor */}
            <WaterSurface size={boundarySize * 2.5} />

            {/* Pac-Man player */}
            <Pacman pacmanState={pacman.current} />

            {/* Pellets */}
            {pellets.map((pellet) => (
              <Pellet key={pellet.id} pellet={pellet} />
            ))}

            {/* Power Pellets */}
            {powerPellets.map((powerPellet) => (
              <PowerPellet key={powerPellet.id} powerPellet={powerPellet} />
            ))}

            {/* Ghosts */}
            {ghosts.map((ghost) => (
              <Ghost key={ghost.id} ghost={ghost} />
            ))}

            <ContactShadows
              position={[0, 0.01, 0]}
              opacity={0.4}
              scale={50}
              blur={2}
              far={30}
            />

            <GameLogic
              keys={keys}
              pacmanState={pacman.current}
              pelletsRef={pelletsRef}
              powerPelletsRef={powerPelletsRef}
              ghostsRef={ghostsRef}
              bounds={worldBounds}
              gameStatus={gameStatus}
              gameStartTime={gameStartTime}
              onPelletEaten={handlePelletEaten}
              onPowerPelletEaten={handlePowerPelletEaten}
              onGhostEaten={handleGhostEaten}
              onPlayerHit={handlePlayerHit}
            />
          </Suspense>
        </Canvas>

        <div style={overlayStyle}>
          <div style={{ pointerEvents: 'auto' }}>
            <GameOverlay
              score={score}
              highScore={highScore}
              lives={lives}
              level={level}
              totalPellets={totalPellets}
              pelletsEaten={totalEaten}
              gameStatus={gameStatus}
              isPoweredUp={pacman.current.isPoweredUp}
              onStart={handleStart}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game3D;

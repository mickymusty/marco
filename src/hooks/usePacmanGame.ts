import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Vector3 } from 'three';
import {
  DIFFICULTY_CONFIGS,
  GHOST_COLORS,
  SCORES,
} from '../constants/index.ts';
import type {
  Bounds3D,
  Difficulty,
  GameStatus,
  GhostState,
  PacmanState,
  PelletState,
  PowerPelletState,
} from '../types/threeGame.ts';

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const ghostColorKeys = Object.keys(GHOST_COLORS) as (keyof typeof GHOST_COLORS)[];

const createPellets = (count: number, bounds: Bounds3D, powerPelletPositions: Vector3[]): PelletState[] => {
  const pellets: PelletState[] = [];
  const spacing = 2.5;
  const gridX = Math.floor((bounds.x * 2) / spacing);
  const gridZ = Math.floor((bounds.z * 2) / spacing);

  // Create a grid of pellets
  const positions: Vector3[] = [];
  for (let i = 0; i < gridX; i++) {
    for (let j = 0; j < gridZ; j++) {
      const x = -bounds.x + spacing / 2 + i * spacing;
      const z = -bounds.z + spacing / 2 + j * spacing;
      // Skip center area (player spawn) and power pellet positions
      if (Math.hypot(x, z) > 3) {
        const tooCloseToPower = powerPelletPositions.some(
          (p) => Math.hypot(x - p.x, z - p.z) < 2
        );
        if (!tooCloseToPower) {
          positions.push(new Vector3(x, 0.3, z));
        }
      }
    }
  }

  // Shuffle and take the needed count
  positions.sort(() => Math.random() - 0.5);
  const selectedPositions = positions.slice(0, count);

  selectedPositions.forEach((pos, index) => {
    pellets.push({
      id: `pellet-${index}`,
      position: pos,
      isEaten: false,
    });
  });

  return pellets;
};

const createPowerPellets = (count: number, bounds: Bounds3D): PowerPelletState[] => {
  const corners = [
    new Vector3(-bounds.x + 2, 0.5, -bounds.z + 2),
    new Vector3(bounds.x - 2, 0.5, -bounds.z + 2),
    new Vector3(-bounds.x + 2, 0.5, bounds.z - 2),
    new Vector3(bounds.x - 2, 0.5, bounds.z - 2),
  ];

  return corners.slice(0, count).map((pos, index) => ({
    id: `power-${index}`,
    position: pos,
    isEaten: false,
  }));
};

const createGhosts = (count: number, bounds: Bounds3D, config: typeof DIFFICULTY_CONFIGS.easy): GhostState[] => {
  return Array.from({ length: count }, (_, index) => {
    const colorKey = ghostColorKeys[index % ghostColorKeys.length];
    // Spawn ghosts at the edges
    const angle = (index / count) * Math.PI * 2;
    const spawnDist = Math.min(bounds.x, bounds.z) - 2;

    return {
      id: `ghost-${index}`,
      position: new Vector3(
        Math.cos(angle) * spawnDist,
        0.6,
        Math.sin(angle) * spawnDist
      ),
      velocity: new Vector3(randomBetween(-1, 1), 0, randomBetween(-1, 1)).normalize().multiplyScalar(config.ghostSpeed),
      speed: config.ghostSpeed,
      baseSpeed: config.ghostSpeed,
      radius: 0.6,
      color: GHOST_COLORS[colorKey],
      mode: 'scatter',
      directionTimer: randomBetween(2, 4),
      spawnDelay: index * config.ghostSpawnDelay,
      isActive: index === 0, // Only first ghost active initially
    };
  });
};

export function usePacmanGame(difficulty: Difficulty = 'medium') {
  const config = useMemo(() => DIFFICULTY_CONFIGS[difficulty], [difficulty]);
  const worldBounds = useMemo(() => config.bounds, [config]);

  const pacman = useRef<PacmanState>({
    position: new Vector3(0, 0.5, 0),
    velocity: new Vector3(),
    speed: config.playerSpeed,
    radius: 0.6,
    mouthAngle: 0.3,
    mouthOpen: true,
    isPoweredUp: false,
    powerUpEndTime: 0,
  });

  const powerPelletPositions = useMemo(
    () => createPowerPellets(config.powerPelletCount, worldBounds).map((p) => p.position),
    [config.powerPelletCount, worldBounds]
  );

  const [pellets, setPellets] = useState<PelletState[]>(() =>
    createPellets(config.pelletCount, worldBounds, powerPelletPositions)
  );
  const pelletsRef = useRef<PelletState[]>(pellets);

  const [powerPellets, setPowerPellets] = useState<PowerPelletState[]>(() =>
    createPowerPellets(config.powerPelletCount, worldBounds)
  );
  const powerPelletsRef = useRef<PowerPelletState[]>(powerPellets);

  const [ghosts, setGhosts] = useState<GhostState[]>(() =>
    createGhosts(config.ghostCount, worldBounds, config)
  );
  const ghostsRef = useRef<GhostState[]>(ghosts);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('pacman3d_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lives, setLives] = useState(config.lives);
  const [level, setLevel] = useState(1);
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready');
  const [pelletsEaten, setPelletsEaten] = useState(0);
  const [ghostsEatenCombo, setGhostsEatenCombo] = useState(0);
  const [comboDisplay, setComboDisplay] = useState<{ points: number; combo: number } | null>(null);

  // Sync refs
  useEffect(() => {
    pelletsRef.current = pellets;
  }, [pellets]);

  useEffect(() => {
    powerPelletsRef.current = powerPellets;
  }, [powerPellets]);

  useEffect(() => {
    ghostsRef.current = ghosts;
  }, [ghosts]);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('pacman3d_highscore', score.toString());
    }
  }, [score, highScore]);

  const startGame = useCallback(() => {
    setGameStatus('playing');
  }, []);

  const togglePause = useCallback(() => {
    setGameStatus((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
  }, []);

  const resetGame = useCallback(() => {
    const newPowerPellets = createPowerPellets(config.powerPelletCount, worldBounds);
    const newPellets = createPellets(config.pelletCount, worldBounds, newPowerPellets.map((p) => p.position));
    const newGhosts = createGhosts(config.ghostCount, worldBounds, config);

    pelletsRef.current = newPellets;
    powerPelletsRef.current = newPowerPellets;
    ghostsRef.current = newGhosts;

    setPellets(newPellets);
    setPowerPellets(newPowerPellets);
    setGhosts(newGhosts);
    setScore(0);
    setLives(config.lives);
    setLevel(1);
    setPelletsEaten(0);
    setGhostsEatenCombo(0);
    setGameStatus('ready');

    pacman.current.position.set(0, 0.5, 0);
    pacman.current.velocity.set(0, 0, 0);
    pacman.current.isPoweredUp = false;
    pacman.current.powerUpEndTime = 0;
    pacman.current.speed = config.playerSpeed;
  }, [config, worldBounds]);

  const nextLevel = useCallback(() => {
    const newPowerPellets = createPowerPellets(config.powerPelletCount, worldBounds);
    const newPellets = createPellets(config.pelletCount, worldBounds, newPowerPellets.map((p) => p.position));
    const newGhosts = createGhosts(config.ghostCount, worldBounds, config);

    // Increase ghost speed slightly each level
    newGhosts.forEach((g) => {
      g.speed = g.baseSpeed + level * 0.3;
      g.baseSpeed = g.speed;
    });

    pelletsRef.current = newPellets;
    powerPelletsRef.current = newPowerPellets;
    ghostsRef.current = newGhosts;

    setPellets(newPellets);
    setPowerPellets(newPowerPellets);
    setGhosts(newGhosts);
    setLevel((prev) => prev + 1);
    setPelletsEaten(0);
    setGhostsEatenCombo(0);
    setScore((prev) => prev + SCORES.levelComplete);

    pacman.current.position.set(0, 0.5, 0);
    pacman.current.velocity.set(0, 0, 0);
    pacman.current.isPoweredUp = false;
    pacman.current.powerUpEndTime = 0;
  }, [config, worldBounds, level]);

  const handlePelletEaten = useCallback((pelletId: string) => {
    const pellet = pelletsRef.current.find((p) => p.id === pelletId);
    if (!pellet || pellet.isEaten) return;

    pellet.isEaten = true;
    pelletsRef.current = pelletsRef.current.filter((p) => p.id !== pelletId);
    setPellets([...pelletsRef.current]);
    setScore((prev) => prev + SCORES.pellet);
    setPelletsEaten((prev) => prev + 1);
  }, []);

  const handlePowerPelletEaten = useCallback((powerPelletId: string) => {
    const powerPellet = powerPelletsRef.current.find((p) => p.id === powerPelletId);
    if (!powerPellet || powerPellet.isEaten) return;

    powerPellet.isEaten = true;
    powerPelletsRef.current = powerPelletsRef.current.filter((p) => p.id !== powerPelletId);
    setPowerPellets([...powerPelletsRef.current]);
    setScore((prev) => prev + SCORES.powerPellet);
    setGhostsEatenCombo(0);

    // Activate power-up
    pacman.current.isPoweredUp = true;
    pacman.current.powerUpEndTime = Date.now() + config.frightenedDuration;

    // Set all ghosts to frightened mode
    ghostsRef.current.forEach((ghost) => {
      if (ghost.isActive && ghost.mode !== 'eaten') {
        ghost.mode = 'frightened';
        ghost.speed = ghost.baseSpeed * 0.5;
      }
    });
    setGhosts([...ghostsRef.current]);
  }, [config.frightenedDuration]);

  const handleGhostEaten = useCallback((ghostId: string) => {
    const ghost = ghostsRef.current.find((g) => g.id === ghostId);
    if (!ghost || ghost.mode !== 'frightened') return;

    ghost.mode = 'eaten';
    const comboMultiplier = Math.pow(2, ghostsEatenCombo);
    const points = SCORES.ghost * comboMultiplier;
    setScore((prev) => prev + points);
    setGhostsEatenCombo((prev) => prev + 1);

    // Show combo display
    setComboDisplay({ points, combo: ghostsEatenCombo + 1 });
    setTimeout(() => setComboDisplay(null), 1500);

    // Respawn ghost at edge after delay
    setTimeout(() => {
      const angle = Math.random() * Math.PI * 2;
      const spawnDist = Math.min(worldBounds.x, worldBounds.z) - 2;
      ghost.position.set(
        Math.cos(angle) * spawnDist,
        0.6,
        Math.sin(angle) * spawnDist
      );
      ghost.mode = pacman.current.isPoweredUp ? 'frightened' : 'chase';
      ghost.speed = pacman.current.isPoweredUp ? ghost.baseSpeed * 0.5 : ghost.baseSpeed;
      setGhosts([...ghostsRef.current]);
    }, 2000);

    setGhosts([...ghostsRef.current]);
  }, [ghostsEatenCombo, worldBounds]);

  const handlePlayerHit = useCallback(() => {
    if (pacman.current.isPoweredUp) return;

    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameStatus('lost');
      } else {
        // Reset positions
        pacman.current.position.set(0, 0.5, 0);
        pacman.current.velocity.set(0, 0, 0);

        // Reset ghosts to edges
        ghostsRef.current.forEach((ghost, index) => {
          const angle = (index / ghostsRef.current.length) * Math.PI * 2;
          const spawnDist = Math.min(worldBounds.x, worldBounds.z) - 2;
          ghost.position.set(
            Math.cos(angle) * spawnDist,
            0.6,
            Math.sin(angle) * spawnDist
          );
          ghost.mode = 'scatter';
        });
        setGhosts([...ghostsRef.current]);
      }
      return newLives;
    });
  }, [worldBounds]);

  const totalPellets = config.pelletCount + config.powerPelletCount;
  const totalEaten = pelletsEaten + (config.powerPelletCount - powerPellets.length);

  // Check for level complete
  useEffect(() => {
    if (gameStatus === 'playing' && pellets.length === 0 && powerPellets.length === 0) {
      nextLevel();
    }
  }, [pellets.length, powerPellets.length, gameStatus, nextLevel]);

  return {
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
    config,
    comboDisplay,
    startGame,
    togglePause,
    resetGame,
    handlePelletEaten,
    handlePowerPelletEaten,
    handleGhostEaten,
    handlePlayerHit,
  };
}

export default usePacmanGame;

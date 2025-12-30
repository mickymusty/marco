export function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.9} color="#bcdcff" />
      <hemisphereLight
        args={['#72c6ff', '#0c1a2e', 0.55]}
        position={[0, 12, 0]}
      />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.35}
        color="#b7e4ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-6, 4, -6]} intensity={0.6} color="#2ac4ff" />
      <spotLight
        position={[0, 12, 0]}
        angle={0.7}
        penumbra={0.3}
        intensity={0.4}
        color="#1e90ff"
      />
    </>
  );
}

export default SceneLights;

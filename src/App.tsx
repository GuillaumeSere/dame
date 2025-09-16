import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import Board from './components/ThreeScene/Board'
import HUD from './components/UI/HUD'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 8, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.7} castShadow />
        <Board />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />
        <Environment preset="city" />
      </Canvas>
      <HUD />
    </div>
  )
}

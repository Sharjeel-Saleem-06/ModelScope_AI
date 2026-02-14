import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float, Stars, Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField() {
    const ref = useRef<THREE.Points>(null!)

    const particles = useMemo(() => {
        const temp = new Float32Array(5000 * 3)
        for (let i = 0; i < 5000; i++) {
            temp[i * 3] = (Math.random() - 0.5) * 10
            temp[i * 3 + 1] = (Math.random() - 0.5) * 10
            temp[i * 3 + 2] = (Math.random() - 0.5) * 10
        }
        return temp
    }, [])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        ref.current.rotation.y = time * 0.05
        ref.current.rotation.x = time * 0.03
    })

    return (
        <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#6366f1"
                size={0.015}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    )
}

function FloatingBrain() {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
                <MeshDistortMaterial
                    color="#8b5cf6"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0}
                    transparent
                    opacity={0.25}
                    emissive="#4f46e5"
                    emissiveIntensity={0.2}
                />
            </Sphere>
        </Float>
    )
}

export default function BackgroundScene() {
    return (
        <div className="canvas-container">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ParticleField />
                <FloatingBrain />
            </Canvas>
        </div>
    )
}

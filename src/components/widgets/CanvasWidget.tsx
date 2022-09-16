/* eslint-disable react/no-unknown-property */
import React, { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Mesh } from "three"
import { Plane, OrbitControls } from "@react-three/drei"
import { Vector } from "./threeutils"

function Cube(props: {
    color: string
    positioner?: (delta: number, position: Vector) => Vector
    rotator?: (delta: number, rotation: Vector) => Vector
}) {
    const { color, rotator, positioner } = props
    const meshRef = useRef<Mesh>()

    // updates outside of react
    useFrame((state, delta) => {
        const { current: mesh } = meshRef
        if (!mesh) return
        const rot = rotator?.(delta, mesh.rotation)
        if (rot) {
            const { x, y, z } = rot
            mesh.rotation.x = x
            mesh.rotation.y = y
            mesh.rotation.z = z
        }
        const pos = positioner?.(delta, mesh.position)
        if (pos) {
            const { x, y, z } = pos
            mesh.position.x = x
            mesh.position.y = y
            mesh.position.z = z
        }
    })

    return (
        <mesh ref={meshRef} receiveShadow castShadow>
            <boxGeometry />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

export default function CanvasWidget(props: {
    color: string
    positioner?: (delta: number, position: Vector) => Vector
    rotator?: (delta: number, rotation: Vector) => Vector
}) {
    const { ...others } = props

    // probably a bot or old browser
    if (typeof ResizeObserver === "undefined") return null

    return (
        <Canvas camera={{ position: [-1, 0.5, 2], fov: 50 }}>
            <hemisphereLight intensity={0.35} />
            <spotLight
                position={[10, 10, 10]}
                angle={0.3}
                penumbra={1}
                intensity={2}
                castShadow
            />
            <Plane
                receiveShadow={true}
                castShadow={true}
                args={[5, 5]}
                position={[0, -1, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            />
            <Cube {...others} />
            <OrbitControls />
        </Canvas>
    )
}

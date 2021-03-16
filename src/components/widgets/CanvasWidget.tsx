import React, { useRef } from "react"
import { Canvas, useFrame } from "react-three-fiber"
import { Mesh } from "three"
import { Line, Plane, OrbitControls } from "@react-three/drei"
import { Vector } from "./threeutils"

function Axis() {
    const lineProps = {
        lineWidth: 4, // In pixels (default)
        dashed: false, // Default
    }
    const c = 1
    return (
        <>
            <Line
                points={[
                    [0, 0, 0],
                    [c, 0, 0],
                ]} // Array of points
                color="blue"
                {...lineProps}
            />
            <Line
                points={[
                    [0, 0, 0],
                    [0, c, 0],
                ]} // Array of points
                color="red"
                {...lineProps}
            />
            <Line
                points={[
                    [0, 0, 0],
                    [0, 0, c],
                ]} // Array of points
                color="black"
                {...lineProps}
            />
        </>
    )
}

function Cube(props: {
    color: string
    rotator: (delta: number, rotation: Vector) => Vector
}) {
    const { color, rotator } = props
    const meshRef = useRef<Mesh>()

    // updates outside of react
    useFrame((state, delta) => {
        const { current: mesh } = meshRef
        if (!mesh) return
        const rot = rotator(delta, mesh.rotation)
        if (!rot) return
        const { x, y, z } = rot
        mesh.rotation.x = x
        mesh.rotation.y = y
        mesh.rotation.z = z
    })

    return (
        <mesh ref={meshRef} receiveShadow castShadow>
            <boxBufferGeometry attach="geometry" />
            <meshPhongMaterial attach="material" color={color} />
        </mesh>
    )
}

export default function CanvasWidget(props: {
    color: string
    showAxes?: boolean
    rotator: (delta: number, rotation: Vector) => Vector
}) {
    const { showAxes, ...others } = props
    return (
        <Canvas shadowMap camera={{ position: [-1, 0.5, 2], fov: 50 }}>
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
            {showAxes && <Axis />}
            <Cube {...others} />
            <OrbitControls />
        </Canvas>
    )
}

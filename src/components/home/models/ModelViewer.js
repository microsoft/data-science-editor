import React, { Suspense, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stage } from "@react-three/drei"

export default function ModelViewer(props) {
    // eslint-disable-next-line react/prop-types
    const { children } = props
    const ref = useRef()
    return (
        <div style={{ position: "relative", width: 640, height: 480 }}>
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                <Suspense fallback={null}>
                    <Stage
                        controls={ref}
                        preset="rembrandt"
                        intensity={1}
                        environment="city"
                    >
                        {children}
                    </Stage>
                </Suspense>
                <OrbitControls ref={ref} autoRotate />
            </Canvas>
        </div>
    )
}
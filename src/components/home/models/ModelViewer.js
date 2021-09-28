import React, { Suspense, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stage } from "@react-three/drei"

export default function ModelViewer(props) {
    // eslint-disable-next-line react/prop-types
    const { children, responsive } = props
    const ref = useRef()
    return (
        <div
            style={
                responsive
                    ? {
                          position: "relative",
                          width: "35vw",
                          height: "35vw",
                      }
                    : {
                          position: "relative",
                          width: "clamp(50vw, 640px, 96vw)",
                          height: "clamp(480px, 60vh, 96vh)",
                      }
            }
        >
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                <Suspense fallback={null}>
                    <Stage
                        controls={ref}
                        intensity={0.5}
                        contactShadow
                        shadows
                        adjustCamera
                    >
                        {children}
                    </Stage>
                </Suspense>
                <OrbitControls ref={ref} autoRotate />
            </Canvas>
        </div>
    )
}

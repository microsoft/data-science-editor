import React, { useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stage } from "@react-three/drei"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"

export default function ModelViewer(props) {
    // eslint-disable-next-line react/prop-types
    const { children, responsive, style, autoRotate } = props
    const ref = useRef()
    const controlsRef = useRef()
    const canvasRef = useRef()
    const supportsFullScreen =
        typeof document !== "undefined" && !!document.fullscreenEnabled
    const handleFullScreen = () => canvasRef.current?.requestFullscreen()
    return (
        <div
            ref={canvasRef}
            style={
                style
                    ? style
                    : responsive
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
            <Canvas
                orthographic={true}
                shadows
                dpr={[1, 2]}
                camera={{ zoom: 4 }}
                resize={{ scroll: false }}
            >
                <Stage
                    controls={ref}
                    intensity={0.5}
                    contactShadow
                    shadows
                    adjustCamera
                >
                    {children}
                </Stage>
                <OrbitControls ref={controlsRef} autoRotate={!!autoRotate} />
            </Canvas>
            {supportsFullScreen && (
                <IconButtonWithTooltip
                    style={{
                        position: "absolute",
                        right: "0.5rem",
                        bottom: "0.5rem",
                    }}
                    size="small"
                    onClick={handleFullScreen}
                    title="full screen"
                >
                    <FullscreenIcon />
                </IconButtonWithTooltip>
            )}
        </div>
    )
}

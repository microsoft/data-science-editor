import React, { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
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
                visible={undefined}
                name={undefined}
                userData={undefined}
                transparent={undefined}
                fog={undefined}
                precision={undefined}
                alphaTest={undefined}
                blendDst={undefined}
                blendDstAlpha={undefined}
                blendEquation={undefined}
                blendEquationAlpha={undefined}
                blending={undefined}
                blendSrc={undefined}
                blendSrcAlpha={undefined}
                clipIntersection={undefined}
                clippingPlanes={undefined}
                clipShadows={undefined}
                colorWrite={undefined}
                defines={undefined}
                depthFunc={undefined}
                depthTest={undefined}
                depthWrite={undefined}
                stencilWrite={undefined}
                stencilFunc={undefined}
                stencilRef={undefined}
                stencilWriteMask={undefined}
                stencilFuncMask={undefined}
                stencilFail={undefined}
                stencilZFail={undefined}
                stencilZPass={undefined}
                polygonOffset={undefined}
                polygonOffsetFactor={undefined}
                polygonOffsetUnits={undefined}
                premultipliedAlpha={undefined}
                dithering={undefined}
                side={undefined}
                shadowSide={undefined}
                toneMapped={undefined}
                uniforms={undefined}
                vertexShader={undefined}
                fragmentShader={undefined}
                wireframe={undefined}
                wireframeLinewidth={undefined}
                lights={undefined}
                clipping={undefined}
                extensions={undefined}
                glslVersion={undefined}
                format={undefined}
                id={undefined}
                uuid={undefined}
                parent={undefined}
                modelViewMatrix={undefined}
                normalMatrix={undefined}
                matrixWorld={undefined}
                matrixAutoUpdate={undefined}
                matrixWorldNeedsUpdate={undefined}
                castShadow={undefined}
                receiveShadow={undefined}
                frustumCulled={undefined}
                renderOrder={undefined}
                animations={undefined}
                customDepthMaterial={undefined}
                customDistanceMaterial={undefined}
                isObject3D={undefined}
                onBeforeRender={undefined}
                onAfterRender={undefined}
                applyMatrix4={undefined}
                applyQuaternion={undefined}
                setRotationFromAxisAngle={undefined}
                setRotationFromEuler={undefined}
                setRotationFromMatrix={undefined}
                setRotationFromQuaternion={undefined}
                rotateOnAxis={undefined}
                rotateOnWorldAxis={undefined}
                rotateX={undefined}
                rotateY={undefined}
                rotateZ={undefined}
                translateOnAxis={undefined}
                translateX={undefined}
                translateY={undefined}
                translateZ={undefined}
                localToWorld={undefined}
                worldToLocal={undefined}
                lookAt={undefined}
                add={undefined}
                remove={undefined}
                removeFromParent={undefined}
                clear={undefined}
                getObjectById={undefined}
                getObjectByName={undefined}
                getObjectByProperty={undefined}
                getWorldPosition={undefined}
                getWorldQuaternion={undefined}
                getWorldScale={undefined}
                getWorldDirection={undefined}
                traverse={undefined}
                traverseVisible={undefined}
                traverseAncestors={undefined}
                updateMatrix={undefined}
                updateMatrixWorld={undefined}
                updateWorldMatrix={undefined}
                toJSON={undefined}
                clone={undefined}
                copy={undefined}
                addEventListener={undefined}
                hasEventListener={undefined}
                removeEventListener={undefined}
                dispatchEvent={undefined}
                material={undefined}
                isMaterial={undefined}
                needsUpdate={undefined}
                version={undefined}
                onBeforeCompile={undefined}
                customProgramCacheKey={undefined}
                setValues={undefined}
                geometry={undefined}
                morphTargetInfluences={undefined}
                morphTargetDictionary={undefined}
                isMesh={undefined}
                updateMorphTargets={undefined}
                derivatives={undefined}
                defaultAttributeValues={undefined}
                index0AttributeName={undefined}
                uniformsNeedUpdate={undefined}
                isShaderMaterial={undefined}
                points={[
                    [0, 0, 0],
                    [c, 0, 0],
                ]} // Array of points
                color="blue"
                {...lineProps}
            />
            <Line
                visible={undefined}
                name={undefined}
                userData={undefined}
                transparent={undefined}
                fog={undefined}
                precision={undefined}
                alphaTest={undefined}
                blendDst={undefined}
                blendDstAlpha={undefined}
                blendEquation={undefined}
                blendEquationAlpha={undefined}
                blending={undefined}
                blendSrc={undefined}
                blendSrcAlpha={undefined}
                clipIntersection={undefined}
                clippingPlanes={undefined}
                clipShadows={undefined}
                colorWrite={undefined}
                defines={undefined}
                depthFunc={undefined}
                depthTest={undefined}
                depthWrite={undefined}
                stencilWrite={undefined}
                stencilFunc={undefined}
                stencilRef={undefined}
                stencilWriteMask={undefined}
                stencilFuncMask={undefined}
                stencilFail={undefined}
                stencilZFail={undefined}
                stencilZPass={undefined}
                polygonOffset={undefined}
                polygonOffsetFactor={undefined}
                polygonOffsetUnits={undefined}
                premultipliedAlpha={undefined}
                dithering={undefined}
                side={undefined}
                shadowSide={undefined}
                toneMapped={undefined}
                uniforms={undefined}
                vertexShader={undefined}
                fragmentShader={undefined}
                wireframe={undefined}
                wireframeLinewidth={undefined}
                lights={undefined}
                clipping={undefined}
                extensions={undefined}
                glslVersion={undefined}
                format={undefined}
                id={undefined}
                uuid={undefined}
                parent={undefined}
                modelViewMatrix={undefined}
                normalMatrix={undefined}
                matrixWorld={undefined}
                matrixAutoUpdate={undefined}
                matrixWorldNeedsUpdate={undefined}
                castShadow={undefined}
                receiveShadow={undefined}
                frustumCulled={undefined}
                renderOrder={undefined}
                animations={undefined}
                customDepthMaterial={undefined}
                customDistanceMaterial={undefined}
                isObject3D={undefined}
                onBeforeRender={undefined}
                onAfterRender={undefined}
                applyMatrix4={undefined}
                applyQuaternion={undefined}
                setRotationFromAxisAngle={undefined}
                setRotationFromEuler={undefined}
                setRotationFromMatrix={undefined}
                setRotationFromQuaternion={undefined}
                rotateOnAxis={undefined}
                rotateOnWorldAxis={undefined}
                rotateX={undefined}
                rotateY={undefined}
                rotateZ={undefined}
                translateOnAxis={undefined}
                translateX={undefined}
                translateY={undefined}
                translateZ={undefined}
                localToWorld={undefined}
                worldToLocal={undefined}
                lookAt={undefined}
                add={undefined}
                remove={undefined}
                removeFromParent={undefined}
                clear={undefined}
                getObjectById={undefined}
                getObjectByName={undefined}
                getObjectByProperty={undefined}
                getWorldPosition={undefined}
                getWorldQuaternion={undefined}
                getWorldScale={undefined}
                getWorldDirection={undefined}
                traverse={undefined}
                traverseVisible={undefined}
                traverseAncestors={undefined}
                updateMatrix={undefined}
                updateMatrixWorld={undefined}
                updateWorldMatrix={undefined}
                toJSON={undefined}
                clone={undefined}
                copy={undefined}
                addEventListener={undefined}
                hasEventListener={undefined}
                removeEventListener={undefined}
                dispatchEvent={undefined}
                material={undefined}
                isMaterial={undefined}
                needsUpdate={undefined}
                version={undefined}
                onBeforeCompile={undefined}
                customProgramCacheKey={undefined}
                setValues={undefined}
                geometry={undefined}
                morphTargetInfluences={undefined}
                morphTargetDictionary={undefined}
                isMesh={undefined}
                updateMorphTargets={undefined}
                derivatives={undefined}
                defaultAttributeValues={undefined}
                index0AttributeName={undefined}
                uniformsNeedUpdate={undefined}
                isShaderMaterial={undefined}
                points={[
                    [0, 0, 0],
                    [0, c, 0],
                ]} // Array of points
                color="red"
                {...lineProps}
            />
            <Line
                visible={undefined}
                name={undefined}
                userData={undefined}
                transparent={undefined}
                fog={undefined}
                precision={undefined}
                alphaTest={undefined}
                blendDst={undefined}
                blendDstAlpha={undefined}
                blendEquation={undefined}
                blendEquationAlpha={undefined}
                blending={undefined}
                blendSrc={undefined}
                blendSrcAlpha={undefined}
                clipIntersection={undefined}
                clippingPlanes={undefined}
                clipShadows={undefined}
                colorWrite={undefined}
                defines={undefined}
                depthFunc={undefined}
                depthTest={undefined}
                depthWrite={undefined}
                stencilWrite={undefined}
                stencilFunc={undefined}
                stencilRef={undefined}
                stencilWriteMask={undefined}
                stencilFuncMask={undefined}
                stencilFail={undefined}
                stencilZFail={undefined}
                stencilZPass={undefined}
                polygonOffset={undefined}
                polygonOffsetFactor={undefined}
                polygonOffsetUnits={undefined}
                premultipliedAlpha={undefined}
                dithering={undefined}
                side={undefined}
                shadowSide={undefined}
                toneMapped={undefined}
                uniforms={undefined}
                vertexShader={undefined}
                fragmentShader={undefined}
                wireframe={undefined}
                wireframeLinewidth={undefined}
                lights={undefined}
                clipping={undefined}
                extensions={undefined}
                glslVersion={undefined}
                format={undefined}
                id={undefined}
                uuid={undefined}
                parent={undefined}
                modelViewMatrix={undefined}
                normalMatrix={undefined}
                matrixWorld={undefined}
                matrixAutoUpdate={undefined}
                matrixWorldNeedsUpdate={undefined}
                castShadow={undefined}
                receiveShadow={undefined}
                frustumCulled={undefined}
                renderOrder={undefined}
                animations={undefined}
                customDepthMaterial={undefined}
                customDistanceMaterial={undefined}
                isObject3D={undefined}
                onBeforeRender={undefined}
                onAfterRender={undefined}
                applyMatrix4={undefined}
                applyQuaternion={undefined}
                setRotationFromAxisAngle={undefined}
                setRotationFromEuler={undefined}
                setRotationFromMatrix={undefined}
                setRotationFromQuaternion={undefined}
                rotateOnAxis={undefined}
                rotateOnWorldAxis={undefined}
                rotateX={undefined}
                rotateY={undefined}
                rotateZ={undefined}
                translateOnAxis={undefined}
                translateX={undefined}
                translateY={undefined}
                translateZ={undefined}
                localToWorld={undefined}
                worldToLocal={undefined}
                lookAt={undefined}
                add={undefined}
                remove={undefined}
                removeFromParent={undefined}
                clear={undefined}
                getObjectById={undefined}
                getObjectByName={undefined}
                getObjectByProperty={undefined}
                getWorldPosition={undefined}
                getWorldQuaternion={undefined}
                getWorldScale={undefined}
                getWorldDirection={undefined}
                traverse={undefined}
                traverseVisible={undefined}
                traverseAncestors={undefined}
                updateMatrix={undefined}
                updateMatrixWorld={undefined}
                updateWorldMatrix={undefined}
                toJSON={undefined}
                clone={undefined}
                copy={undefined}
                addEventListener={undefined}
                hasEventListener={undefined}
                removeEventListener={undefined}
                dispatchEvent={undefined}
                material={undefined}
                isMaterial={undefined}
                needsUpdate={undefined}
                version={undefined}
                onBeforeCompile={undefined}
                customProgramCacheKey={undefined}
                setValues={undefined}
                geometry={undefined}
                morphTargetInfluences={undefined}
                morphTargetDictionary={undefined}
                isMesh={undefined}
                updateMorphTargets={undefined}
                derivatives={undefined}
                defaultAttributeValues={undefined}
                index0AttributeName={undefined}
                uniformsNeedUpdate={undefined}
                isShaderMaterial={undefined}
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
                key={""}
                onPointerMissed={undefined}
                material={undefined}
                quaternion={undefined}
                attach={undefined}
                onUpdate={undefined}
                up={undefined}
                scale={undefined}
                matrix={undefined}
                layers={undefined}
                dispose={undefined}
                onClick={undefined}
                onContextMenu={undefined}
                onDoubleClick={undefined}
                onPointerUp={undefined}
                onPointerDown={undefined}
                onPointerOver={undefined}
                onPointerOut={undefined}
                onPointerEnter={undefined}
                onPointerLeave={undefined}
                onPointerMove={undefined}
                onPointerCancel={undefined}
                onWheel={undefined}
                visible={undefined}
                type={undefined}
                id={undefined}
                uuid={undefined}
                name={undefined}
                parent={undefined}
                modelViewMatrix={undefined}
                normalMatrix={undefined}
                matrixWorld={undefined}
                matrixAutoUpdate={undefined}
                matrixWorldNeedsUpdate={undefined}
                frustumCulled={undefined}
                renderOrder={undefined}
                animations={undefined}
                userData={undefined}
                customDepthMaterial={undefined}
                customDistanceMaterial={undefined}
                isObject3D={undefined}
                onBeforeRender={undefined}
                onAfterRender={undefined}
                applyMatrix4={undefined}
                applyQuaternion={undefined}
                setRotationFromAxisAngle={undefined}
                setRotationFromEuler={undefined}
                setRotationFromMatrix={undefined}
                setRotationFromQuaternion={undefined}
                rotateOnAxis={undefined}
                rotateOnWorldAxis={undefined}
                rotateX={undefined}
                rotateY={undefined}
                rotateZ={undefined}
                translateOnAxis={undefined}
                translateX={undefined}
                translateY={undefined}
                translateZ={undefined}
                localToWorld={undefined}
                worldToLocal={undefined}
                lookAt={undefined}
                add={undefined}
                remove={undefined}
                removeFromParent={undefined}
                clear={undefined}
                getObjectById={undefined}
                getObjectByName={undefined}
                getObjectByProperty={undefined}
                getWorldPosition={undefined}
                getWorldQuaternion={undefined}
                getWorldScale={undefined}
                getWorldDirection={undefined}
                raycast={undefined}
                traverse={undefined}
                traverseVisible={undefined}
                traverseAncestors={undefined}
                updateMatrix={undefined}
                updateMatrixWorld={undefined}
                updateWorldMatrix={undefined}
                toJSON={undefined}
                clone={undefined}
                copy={undefined}
                addEventListener={undefined}
                hasEventListener={undefined}
                removeEventListener={undefined}
                dispatchEvent={undefined}
                geometry={undefined}
                morphTargetInfluences={undefined}
                morphTargetDictionary={undefined}
                isMesh={undefined}
                updateMorphTargets={undefined}
            />
            {showAxes && <Axis />}
            <Cube {...others} />
            <OrbitControls />
        </Canvas>
    )
}

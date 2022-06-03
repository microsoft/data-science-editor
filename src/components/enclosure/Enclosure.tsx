import React, { lazy } from "react"
import { useMemo } from "react"
import Alert from "../ui/Alert"
import Suspense from "../ui/Suspense"
import { DEFAULT_OPTIONS, shapeToEC30 } from "./ec30"

const EnclosureGenerator = lazy(() => import("../enclosure/EnclosureGenerator"))

export default function Enclosure(props: {
    shape: jdspec.Shape
    depth?: number
}) {
    const { shape, depth } = props
    const options = DEFAULT_OPTIONS
    const model = useMemo(() => shapeToEC30(shape, depth), [shape, depth])
    if (!model)
        return <Alert severity="info">PCB form factor is not supported.</Alert>

    return (
        <Suspense>
            <EnclosureGenerator
                model={model}
                options={options}
                hideAfterGenerated={true}
            />
        </Suspense>
    )
}

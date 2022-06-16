import React from "react"
import useDeviceCatalog from "../devices/useDeviceCatalog"
import useChange from "../../jacdac/useChange"
import DeviceImageList from "../devices/DeviceImageList"

export default function JacdaptorImageList(props: { cols?: number }) {
    const { cols } = props
    const catalog = useDeviceCatalog()
    const ids = useChange(catalog, _ =>
        _?.specifications()
            .filter(spec => spec.tags?.includes("adapter"))
            .map(spec => spec.id)
    )
    return <DeviceImageList cols={cols} ids={ids} />
}

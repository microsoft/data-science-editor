import React from "react"
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
} from "@mui/material"
import useDataUri from "../hooks/useDataUri"
import ChipList from "../ui/ChipList"
import useEC30Model from "./useEC30Model"
import { useModelDXF, useModelSvg } from "./useModelExports"
import type { EnclosureModel } from "../../workers/cad/dist/node_modules/enclosurecad"

export default function EC30(props: { model: EnclosureModel }) {
    const { model: enclosure } = props
    const { grid } = enclosure
    const { width: gw, height: gh } = grid

    const m = useEC30Model(gw, gh)
    const svg = useModelSvg(m)
    const svgUri = useDataUri(svg)
    const dxf = useModelDXF(m)
    const dxfUri = useDataUri(dxf)

    return (
        <Card>
            <CardHeader title="box.svg" />
            <CardContent>
                <div dangerouslySetInnerHTML={{ __html: svg }} />
            </CardContent>
            <CardActions>
                <ChipList>
                    <Button
                        variant="outlined"
                        href={svgUri}
                        download={"box.svg"}
                    >
                        Download SVG
                    </Button>
                    <Button
                        variant="outlined"
                        href={dxfUri}
                        download={"box.dxf"}
                    >
                        Download DXF
                    </Button>
                </ChipList>
            </CardActions>
        </Card>
    )
}

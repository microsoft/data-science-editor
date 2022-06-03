import React from "react"
import { Button, Card, CardActions, CardContent } from "@mui/material"
import useDataUri from "../hooks/useDataUri"
import ChipList from "../ui/ChipList"
import useEC30Model from "./useEC30Model"
import { useModelDXF, useModelSvg } from "./useModelExports"

export default function EC30(props: { gw: number; gh: number }) {
    const { gw, gh } = props

    const m = useEC30Model(gw, gh)
    const svg = useModelSvg(m)
    const svgUri = useDataUri(svg)
    const dxf = useModelDXF(m)
    const dxfUri = useDataUri(dxf)

    return (
        <Card>
            <CardContent>
                <div dangerouslySetInnerHTML={{ __html: svg }} />
            </CardContent>
            <CardActions>
                <ChipList>
                    <Button
                        variant="outlined"
                        href={svgUri}
                        download={"ec30.svg"}
                    >
                        Download SVG
                    </Button>
                    <Button
                        variant="outlined"
                        href={dxfUri}
                        download={"ec30.dxf"}
                    >
                        Download DXF
                    </Button>
                </ChipList>
            </CardActions>
        </Card>
    )
}

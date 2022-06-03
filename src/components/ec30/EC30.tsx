import React, { useMemo } from "react"
import { model, paths, exporter, IModel } from "makerjs"
import { Button, Card, CardActions, CardContent } from "@mui/material"

const MOUNTING_HOLE_RADIUS = 3.1 / 2
const CORNER_RADIUS = 1
const NOTCH_RADIUS = 1
const NOTCH_OFFSET = 1.5
const NOTCH_CORNER_RADIUS = 0.2
const GRID = 5
const GRID2 = GRID / 2

const EDGE_WIDTH = 5.9
const EDGE_HEIGHT = 6.6
const EDGE_CORNER_RADIUS = 0.8
const EDGE_BUTT_RADIUS = CORNER_RADIUS
const EDGE_GAP = 2.7
const EDGE_OFFSET = 2

export default function EC30(props: { gw: number; gh: number }) {
    const { gw, gh } = props

    const { __html, width, height } = useMemo(() => {
        const w = gw * GRID * 2
        const h = gh * GRID * 2

        const aw = w + 2 * (EDGE_WIDTH - EDGE_OFFSET)
        const ah = h + 2 * (EDGE_WIDTH - EDGE_OFFSET)

        const w2 = w / 2
        const h2 = h / 2

        const eh2 = EDGE_HEIGHT / 2
        const ehf2 = eh2 + EDGE_GAP + CORNER_RADIUS

        const corner: IModel = {
            paths: {
                // upper right corner
                rightv: new paths.Line([GRID2, 0], [GRID2, -GRID2]),
                curve: new paths.Arc([0, 0], GRID2, 0, 90),
                lefth: new paths.Line([0, GRID2], [-GRID2, GRID2]),
            },
        }

        const halfnotch: IModel = {
            paths: {
                halfarc: new paths.Arc(
                    [0, -NOTCH_OFFSET + NOTCH_RADIUS],
                    NOTCH_RADIUS,
                    270,
                    360
                ),
                notch_up: new paths.Line(
                    [NOTCH_RADIUS, -NOTCH_OFFSET + NOTCH_RADIUS],
                    [NOTCH_RADIUS, 0]
                ),
                notch_to_right: new paths.Arc(
                    [NOTCH_RADIUS + NOTCH_CORNER_RADIUS, -NOTCH_CORNER_RADIUS],
                    NOTCH_CORNER_RADIUS,
                    90,
                    180
                ),
            },
        }
        const notch: IModel = {
            models: {
                right: model.clone(halfnotch),
                left: model.mirror(model.clone(halfnotch), true, false),
            },
        }

        const upper_ridge: IModel = {
            models: {
                notch: model.move(model.clone(notch), [
                    -w2 - GRID2 + 7 - NOTCH_RADIUS,
                    0,
                ]),
            },
            paths: {
                line: new paths.Line(
                    [-w2 + GRID2 + 2 * NOTCH_RADIUS + NOTCH_CORNER_RADIUS, 0],
                    [w2 - GRID2, 0]
                ),
            },
        }
        const hridge: IModel = {
            paths: {
                line: new paths.Line([-w2 + GRID2, 0], [w2 - GRID2, 0]),
            },
        }
        const vridge: IModel = {
            paths: {
                line: new paths.Line([0, -h2 + GRID2], [0, h2 - GRID2]),
            },
        }
        const v_edge_ridge: IModel = {
            paths: {
                line: new paths.Line(
                    [0, h2 - GRID2],
                    [0, ehf2]
                ),
            },
        }
        const hole: IModel = {
            paths: { hole: new paths.Circle(MOUNTING_HOLE_RADIUS) },
        }
        const holes: IModel = {
            models: {
                upper_right: model.move(model.clone(hole), [w2, h2]),
                upper_left: model.move(model.clone(hole), [-w2, h2]),
                lower_right: model.move(model.clone(hole), [-w2, -h2]),
                lower_left: model.move(model.clone(hole), [w2, -h2]),
            },
        }
        const halfedge: IModel = {
            paths: {
                up: new paths.Line(
                    [EDGE_WIDTH, 0],
                    [EDGE_WIDTH, eh2 - EDGE_CORNER_RADIUS]
                ),
                up_to_top: new paths.Arc(
                    [EDGE_WIDTH - EDGE_CORNER_RADIUS, eh2 - EDGE_CORNER_RADIUS],
                    EDGE_CORNER_RADIUS,
                    0,
                    90
                ),
                top: new paths.Line(
                    [EDGE_WIDTH - EDGE_CORNER_RADIUS, eh2],
                    [EDGE_BUTT_RADIUS, eh2]
                ),
                top_to_up: new paths.Arc(
                    [EDGE_BUTT_RADIUS, eh2 + EDGE_BUTT_RADIUS],
                    EDGE_BUTT_RADIUS,
                    180,
                    270
                ),
                gap_up: new paths.Line(
                    [0, eh2 + EDGE_BUTT_RADIUS],
                    [0, eh2 + EDGE_GAP - EDGE_BUTT_RADIUS]
                ),
                gap_up_to_right: new paths.Arc(
                    [EDGE_BUTT_RADIUS, eh2 + EDGE_GAP - EDGE_BUTT_RADIUS],
                    EDGE_BUTT_RADIUS,
                    90,
                    180
                ),
                right_right: new paths.Line(
                    [EDGE_BUTT_RADIUS, eh2 + EDGE_GAP],
                    [EDGE_OFFSET + GRID2 - CORNER_RADIUS, eh2 + EDGE_GAP]
                ),
                right_to_up: new paths.Arc(
                    [
                        EDGE_OFFSET + GRID2 - CORNER_RADIUS,
                        eh2 + EDGE_GAP + CORNER_RADIUS,
                    ],
                    CORNER_RADIUS,
                    270,
                    360
                ),
                up_again: new paths.Line(
                    [EDGE_OFFSET + GRID2, eh2 + EDGE_GAP + CORNER_RADIUS],
                    [EDGE_OFFSET + GRID2, (GRID * 3) / 2]
                ),
            },
        }
        const edge: IModel = {
            models: {
                up: model.clone(halfedge),
                down: model.move(
                    model.mirror(model.clone(halfedge), false, true),
                    [0, 0]
                ),
            },
        }
        const pcb: IModel = {
            models: {
                holes: model.clone(holes),
                upper_right_corner: model.move(model.clone(corner), [w2, h2]),
                upper_ridge: model.move(model.clone(upper_ridge), [
                    0,
                    h2 + GRID2,
                ]),
                upper_left_corner: model.move(
                    model.rotate(model.clone(corner), 90),
                    [-w2, h2]
                ),

                left_upper_right: model.move(model.clone(v_edge_ridge), [-w2 - GRID2, 0]),
                left_edge: model.move(
                    model.mirror(model.clone(edge), true, false),
                    [-w2 + EDGE_OFFSET, 0]
                ),
                left_lower_right: model.move(model.mirror(model.clone(v_edge_ridge), false, true), [-w2 - GRID2, 0]),

                lower_left_corner: model.move(
                    model.rotate(model.clone(corner), 180),
                    [-w2, -h2]
                ),
                lower_ridge: model.move(model.clone(hridge), [0, -h2 - GRID2]),
                lower_right_corner: model.move(
                    model.rotate(model.clone(corner), -90),
                    [w2, -h2]
                ),

                right_upper_right: model.move(model.clone(v_edge_ridge), [w2 + GRID2, 0]),
                right_edge: model.move(model.clone(edge), [
                    w2 - EDGE_OFFSET,
                    0,
                ]),
                right_lower_right: model.move(model.mirror(model.clone(v_edge_ridge), false, true), [w2 + GRID2, 0]),
            },
        }

        const frame = model.move(pcb, [aw / 2, ah / 2])
        return {
            __html: exporter.toSVG(frame, {
                units: "mm",
                strokeWidth: "2",
            }) as string,
            width: aw,
            height: ah,
        }
    }, [gw, gh])

    const svgUri = `data:text/plain;charset=UTF-8,${encodeURIComponent(__html)}`

    return (
        <Card>
            <CardContent>
                <div dangerouslySetInnerHTML={{ __html }} />
            </CardContent>
            <CardActions>
                <Button variant="outlined" href={svgUri} download={"ec30.svg"}>
                    Download SVG
                </Button>
            </CardActions>
        </Card>
    )
}

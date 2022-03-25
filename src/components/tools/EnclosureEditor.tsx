import React, { ChangeEvent, lazy, useEffect, useMemo, useState } from "react"
import { Grid, TextField, Typography } from "@mui/material"
import useLocalStorage from "../hooks/useLocalStorage"
import HighlightTextField from "../ui/HighlightTextField"
import RefreshIcon from "@mui/icons-material/Refresh"
import type {
    EnclosureModel,
    EnclosureOptions,
} from "../../workers/cad/dist/node_modules/enclosurecad"
import Suspense from "../ui/Suspense"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import { useId } from "react-use-id-hook"
import SliderWithLabel from "../ui/SliderWithLabel"
import SwitchWithLabel from "../ui/SwitchWithLabel"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
const EnclosureGenerator = lazy(() => import("./EnclosureGenerator"))

const STORAGE_KEY = "jacdac:enclosureeditorkey_source"
const OPTIONS_STORAGE_KEY = "jacdac:enclosureeditorkey_options"
const DEFAULT_OPTIONS: EnclosureOptions = {
    legs: {
        type: "well",
    },
    cover: {},
}

function generateGridEnclosureModel(
    gridWidth: number,
    gridHeight: number,
    depth = 6
): EnclosureModel {
    const width = gridWidth * 10
    const height = gridHeight * 10
    const c = 7
    const boxWidth = width + c
    const boxHeight = height + c
    return {
        name: `${width}x${height}`,
        box: {
            width: boxWidth,
            height: boxHeight,
            depth,
        },
        rings: [
            {
                x: width >> 1,
                y: height >> 1,
            },
            {
                x: width >> 1,
                y: -(height >> 1),
            },
            {
                x: -(width >> 1),
                y: -(height >> 1),
            },
            {
                x: -(width >> 1),
                y: height >> 1,
            },
        ],
        components: [
            {
                x: -(width >> 1) + 1.5,
                y: 0,
                type: "led",
            },
            {
                x: (width >> 1) - 1.5,
                y: 0,
                type: "led",
            },
            {
                x: 0,
                y: -(height >> 1) + 1.5,
                type: "led",
            },
            {
                x: 0,
                y: (height >> 1) - 1.5,
                type: "led",
            },
        ],
        connectors: [
            {
                x: 0,
                y: -(width >> 1) + 2,
                dir: "bottom",
                type: "jacdac",
            },
            {
                x: 0,
                y: (width >> 1) - 2,
                dir: "top",
                type: "jacdac",
            },
            {
                x: -(width >> 1) + 2,
                y: 0,
                dir: "left",
                type: "jacdac",
            },
            {
                x: (width >> 1) - 2,
                y: 0,
                dir: "right",
                type: "jacdac",
            },
        ],
    }
}

function EnclosureDesign(props: {
    setSource: (src: string) => void
    setOptions: (str: string) => void
}) {
    const { setSource, setOptions } = props
    const [gridWidth, setGridWith] = useState(2)
    const [gridHeight, setGridHeight] = useState(2)
    const [depth, setDepth] = useState(6)
    const [legs, setLegs] = useState(true)

    const gridHeightId = useId()
    const gridWidthId = useId()
    const depthId = useId()
    const legsId = useId()

    const handleGridWidth: any = (
        event: React.ChangeEvent<unknown>,
        value: number | number[]
    ) => setGridWith(value as number)
    const handleGridHeight: any = (
        event: React.ChangeEvent<unknown>,
        value: number | number[]
    ) => setGridHeight(value as number)
    const handleLegs = (ev, checked: boolean) => {
        setLegs(checked)
    }
    const handleDepthChange = (event: ChangeEvent<HTMLInputElement>) => {
        setDepth(Number(event.target.value))
    }

    useEffect(() => {
        const model = generateGridEnclosureModel(gridWidth, gridHeight)
        const source = JSON.stringify(model, null, 4)
        setSource(source)
    }, [gridWidth, gridHeight])

    useEffect(() => {
        const options: EnclosureOptions = {
            cover: {},
        }
        if (legs)
            options.legs = {
                type: "well",
            }
        const source = JSON.stringify(options, null, 4)
        setOptions(source)
    }, [legs])

    return (
        <>
            <Grid item>
                <SliderWithLabel
                    id={gridWidthId}
                    label={`grid width: ${gridWidth * 10}mm`}
                    value={gridWidth}
                    onChange={handleGridWidth}
                    min={2}
                    max={12}
                />
            </Grid>
            <Grid item>
                <SliderWithLabel
                    id={gridHeightId}
                    label={`grid height: ${gridHeight * 10}mm`}
                    value={gridHeight}
                    onChange={handleGridHeight}
                    min={2}
                    max={12}
                />
            </Grid>
            <Grid item>
                <TextField
                    id={depthId}
                    label="depth (mm)"
                    value={depth}
                    type="number"
                    onChange={handleDepthChange}
                    inputProps={{ min: 5.5, max: 40, step: 0.5 }}
                />
            </Grid>
            <Grid item>
                <SwitchWithLabel
                    id={legsId}
                    label="legs"
                    onChange={handleLegs}
                    checked={legs}
                />
            </Grid>
        </>
    )
}

export default function EnclosureEditor() {
    const [source, setSource] = useLocalStorage(
        STORAGE_KEY,
        JSON.stringify(generateGridEnclosureModel(2, 2), null, 4)
    )
    const [options, setOptions] = useLocalStorage(
        OPTIONS_STORAGE_KEY,
        JSON.stringify(DEFAULT_OPTIONS, null, 4)
    )
    const enclosure: EnclosureModel = useMemo(() => {
        try {
            return JSON.parse(source)
        } catch (e) {
            console.debug(e)
            return undefined
        }
    }, [source])
    const enclosureOptions: EnclosureOptions = useMemo(() => {
        try {
            return JSON.parse(options)
        } catch (e) {
            console.debug(e)
            return undefined
        }
    }, [options])
    const handleRefreshSource = () =>
        setSource(JSON.stringify(generateGridEnclosureModel(2, 2), null, 4))
    const handleRefreshOptions = () =>
        setOptions(JSON.stringify(DEFAULT_OPTIONS, null, 4))
    return (
        <Grid spacing={2} container>
            <EnclosureDesign setSource={setSource} setOptions={setOptions} />
            <Grid item xs={12}>
                <Suspense>
                    <EnclosureGenerator
                        module={enclosure}
                        options={enclosureOptions}
                        color="#888"
                    />
                </Suspense>
            </Grid>
            {Flags.diagnostics && (
                <Grid item xs={12}>
                    <Typography variant="subtitle1" component="span">
                        Model
                    </Typography>
                    <IconButtonWithTooltip
                        title="reset"
                        size="small"
                        onClick={handleRefreshSource}
                    >
                        <RefreshIcon />
                    </IconButtonWithTooltip>
                    <HighlightTextField
                        code={source}
                        language={"json"}
                        onChange={setSource}
                    />
                </Grid>
            )}
            {Flags.diagnostics && (
                <Grid item xs={12}>
                    <Typography variant="subtitle1" component="span">
                        Options
                    </Typography>
                    <IconButtonWithTooltip
                        title="reset"
                        size="small"
                        onClick={handleRefreshOptions}
                    >
                        <RefreshIcon />
                    </IconButtonWithTooltip>
                    <HighlightTextField
                        minHeight="8rem"
                        code={options}
                        language={"json"}
                        onChange={setOptions}
                    />
                </Grid>
            )}
        </Grid>
    )
}

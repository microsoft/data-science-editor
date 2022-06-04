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
import { useId } from "react"
import SliderWithLabel from "../ui/SliderWithLabel"
import SwitchWithLabel from "../ui/SwitchWithLabel"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import { DEFAULT_OPTIONS, generateEC30EnclosureModel } from "../enclosure/ec30"
const EnclosureGenerator = lazy(() => import("../enclosure/EnclosureGenerator"))

const STORAGE_KEY = "jacdac:enclosureeditorkey_source"
const OPTIONS_STORAGE_KEY = "jacdac:enclosureeditorkey_options"

function EnclosureDesign(props: {
    setSource: (src: string) => void
    setOptions: (str: string) => void
}) {
    const { setSource, setOptions } = props
    const [gridWidth, setGridWith] = useState(2)
    const [gridHeight, setGridHeight] = useState(2)
    const [depth, setDepth] = useState(6)
    const [legs, setLegs] = useState(true)

    const id = useId()
    const gridHeightId = id + "-height"
    const gridWidthId = id + "-width"
    const depthId = id + "-depth"
    const legsId = id + "-legs"

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
        const model = generateEC30EnclosureModel(gridWidth, gridHeight, "lr", depth)
        const source = JSON.stringify(model, null, 4)
        setSource(source)
    }, [gridWidth, gridHeight, depth])

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
        JSON.stringify(generateEC30EnclosureModel(2, 2, ""), null, 4)
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
        setSource(JSON.stringify(generateEC30EnclosureModel(2, 2, ""), null, 4))
    const handleRefreshOptions = () =>
        setOptions(JSON.stringify(DEFAULT_OPTIONS, null, 4))
    return (
        <Grid spacing={2} container>
            <EnclosureDesign setSource={setSource} setOptions={setOptions} />
            <Grid item xs={12}>
                <Suspense>
                    <EnclosureGenerator
                        model={enclosure}
                        options={enclosureOptions}
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
                        language="json"
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

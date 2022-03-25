import React, { lazy, useEffect, useMemo, useState } from "react"
import {
    Button,
    Grid,
    Menu,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material"
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
const EnclosureGenerator = lazy(() => import("./EnclosureGenerator"))

const STORAGE_KEY = "jacdac:enclosureeditorkey_source"
const OPTIONS_STORAGE_KEY = "jacdac:enclosureeditorkey_options"
const DEFAULT_OPTIONS = {
    cover: {},
}

function generateGridEnclosureModel(
    gridWidth: number,
    gridHeight: number
): EnclosureModel {
    const width = gridWidth * 10
    const height = gridHeight * 10
    return {
        name: `${width}x${height}`,
        box: {
            width: width + 7,
            height: height + 7,
            depth: 6.5,
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
                x: -5,
                y: 1,
                type: "led",
            },
            {
                x: 0,
                y: 0,
                type: "circle",
                radius: 2,
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

const modules: EnclosureModel[] = [
    { width: 2, height: 2 },
    { width: 3, height: 3 },
    { width: 3, height: 2 },
    { width: 6, height: 3 },
].map(({ width, height }) => generateGridEnclosureModel(width, height))

function ExampleMenu(props: { setSource: (source: string) => void }) {
    const { setSource } = props
    const [anchorEl, setAnchorEl] = React.useState(null)
    const open = Boolean(anchorEl)
    const id = useId()
    const handleClick = event => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }
    const handleModule = (module: EnclosureModel) => () => {
        setSource(JSON.stringify(module, null, 4))
        handleClose()
    }

    return (
        <div>
            <Button
                id={id}
                variant="outlined"
                aria-controls="basic-menu"
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
            >
                Examples
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
            >
                {modules.map(module => (
                    <MenuItem key={module.name} onClick={handleModule(module)}>
                        {module.name}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    )
}

function EnclosureDesign(props: { setSource: (src: string) => void }) {
    const { setSource } = props
    const [gridWidth, setGridWith] = useState(2)
    const gridWidthId = useId()
    const [gridHeight, setGridHeight] = useState(2)
    const gridHeightId = useId()

    const handleGridWidth: any = (
        event: React.ChangeEvent<unknown>,
        value: number | number[]
    ) => setGridWith(value as number)
    const handleGridHeight: any = (
        event: React.ChangeEvent<unknown>,
        value: number | number[]
    ) => setGridHeight(value as number)

    useEffect(() => {
        const model = generateGridEnclosureModel(gridWidth, gridHeight)
        const source = JSON.stringify(model, null, 2)
        setSource(source)
    }, [gridWidth, gridHeight])

    return (
        <Grid container spacing={1}>
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
        </Grid>
    )
}

export default function EnclosureEditor() {
    const [source, setSource] = useLocalStorage(
        STORAGE_KEY,
        JSON.stringify(modules[0], null, 4)
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
        setSource(JSON.stringify(modules[0], null, 4))
    const handleRefreshOptions = () =>
        setOptions(JSON.stringify(DEFAULT_OPTIONS, null, 4))
    return (
        <Grid spacing={1} container>
            <Grid item xs={12}>
                <EnclosureDesign setSource={setSource} />
            </Grid>
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
            <Grid item xs={12}>
                <Suspense>
                    <EnclosureGenerator
                        module={enclosure}
                        options={enclosureOptions}
                        color="#888"
                    />
                </Suspense>
            </Grid>
        </Grid>
    )
}

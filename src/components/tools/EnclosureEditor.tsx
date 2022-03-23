import React, { lazy, useMemo } from "react"
import { Button, Grid, Menu, MenuItem, Typography } from "@mui/material"
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
const EnclosureGenerator = lazy(() => import("./EnclosureGenerator"))

const STORAGE_KEY = "jacdac:enclosureeditorkey_source"
const OPTIONS_STORAGE_KEY = "jacdac:enclosureeditorkey_options"
const DEFAULT_OPTIONS = {
    cover: {},
}
const modules: EnclosureModel[] = [
    { width: 20, height: 20 },
    { width: 30, height: 30 },
    { width: 30, height: 20 },
    { width: 60, height: 30 },
].map(({ width, height }) => ({
    name: `${width}x${height}`,
    box: {
        width: width + 8,
        height: height + 5,
        depth: 5.5,
    },
    rings: [
        {
            x: width >> 1,
            y: height >> 1,
            notch: "right",
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
            x: 0,
            y: 6,
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
}))

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
    const handleFormat = () => {
        setSource(JSON.stringify(enclosure, null, 4))
        setOptions(JSON.stringify(enclosureOptions, null, 4))
    }
    const handleRefreshSource = () =>
        setSource(JSON.stringify(modules[0], null, 4))
    const handleRefreshOptions = () =>
        setOptions(JSON.stringify(DEFAULT_OPTIONS, null, 4))
    return (
        <Grid spacing={1} container>
            <Grid item>
                <Button
                    variant="outlined"
                    onClick={handleFormat}
                    disabled={!enclosure || !enclosureOptions}
                >
                    Format code
                </Button>
            </Grid>
            <Grid item>
                <ExampleMenu setSource={setSource} />
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

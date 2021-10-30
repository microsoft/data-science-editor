import React, { lazy, useMemo } from "react"
import { Button, Grid, Typography } from "@material-ui/core"
import useLocalStorage from "../hooks/useLocalStorage"
import HighlightTextField from "../ui/HighlightTextField"
import type {
    EnclosureModel,
    EnclosureOptions,
} from "../../workers/cad/dist/node_modules/enclosurecad"
import Suspense from "../ui/Suspense"
const EnclosureGenerator = lazy(() => import("./EnclosureGenerator"))

const STORAGE_KEY = "jacdac:enclosureeditorkey_source"
const OPTIONS_STORAGE_KEY = "jacdac:enclosureeditorkey_options"
const DEFAULT_MODEL = {
    box: {
        width: 22,
        height: 29,
        depth: 10,
    },
    rings: [
        {
            x: 7.5,
            y: 7.5,
        },
        {
            x: -7.5,
            y: -7.5,
        },
        {
            x: -7.5,
            y: 7.5,
        },
        {
            x: 7.5,
            y: -7.5,
        },
    ],
    connectors: [
        {
            x: 0,
            y: 7.5,
            dir: "top",
            type: "jacdac",
        },
        {
            x: 0,
            y: 7.5,
            dir: "bottom",
            type: "jacdac",
        },
    ],
}
const DEFAULT_OPTIONS = {
    legs: { type: "well" },
    cover: {
        mounts: {
            type: "ring",
        },
    },
}

export default function EnclosureEditor() {
    const [source, setSource] = useLocalStorage(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_MODEL, null, 4)
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
        setSource(JSON.stringify(enclosureOptions, null, 4))
    }
    return (
        <Grid spacing={1} container>
            <Grid item xs={12}>
                <Button
                    variant="outlined"
                    onClick={handleFormat}
                    disabled={!enclosure || !enclosureOptions}
                >
                    Format code
                </Button>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="caption">Model</Typography>
                <HighlightTextField
                    code={source}
                    language={"json"}
                    onChange={setSource}
                />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="caption">Options</Typography>
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
                        color="#777"
                    />
                </Suspense>
            </Grid>
        </Grid>
    )
}

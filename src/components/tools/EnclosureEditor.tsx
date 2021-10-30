import React, { lazy, useMemo } from "react"
import { Button, Grid } from "@material-ui/core"
import useLocalStorage from "../hooks/useLocalStorage"
import HighlightTextField from "../ui/HighlightTextField"
import type {
    EnclosureModel,
    EnclosureOptions,
} from "../../workers/cad/dist/node_modules/enclosurecad"
import Suspense from "../ui/Suspense"
const EnclosureGenerator = lazy(() => import("./EnclosureGenerator"))

const STORAGE_KEY = "jacdac:enclosureeditorkey"
const DEFAULT_MODEL = {
    box: {
        width: 25,
        height: 27.5,
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

export default function EnclosureEditor() {
    const [source, setSource] = useLocalStorage(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_MODEL, null, 4)
    )
    const options: EnclosureOptions = useMemo(
        () => ({
            legs: { type: "well" },
            cover: {
                mounts: {
                    type: "ring",
                },
            },
        }),
        []
    )
    const enclosure: EnclosureModel = useMemo(() => {
        try {
            return JSON.parse(source)
        } catch (e) {
            console.debug(e)
            return undefined
        }
    }, [source])
    const handleFormat = () => {
        setSource(JSON.stringify(enclosure, null, 4))
    }
    return (
        <Grid spacing={1} container>
            <Grid item xs={12}>
                <Button
                    variant="outlined"
                    onClick={handleFormat}
                    disabled={!enclosure}
                >
                    Format code
                </Button>
            </Grid>
            <Grid item xs={12}>
                <HighlightTextField
                    code={source}
                    language={"json"}
                    onChange={setSource}
                />
            </Grid>
            <Grid item xs={12}>
                <Suspense>
                    <EnclosureGenerator
                        module={enclosure}
                        options={options}
                        color="#444"
                    />
                </Suspense>
            </Grid>
        </Grid>
    )
}

import React, { useMemo } from "react"
import { Button, Grid } from "@material-ui/core"
import useLocalStorage from "../hooks/useLocalStorage"
import HighlightTextField from "../ui/HighlightTextField"
import EnclosureGenerator from "./EnclosureGenerator"
import { Enclosure, modules } from "./enclosurecad"

const STORAGE_KEY = "jacdac:enclosureeditorkey"

export default function EnclosureEditor() {
    const [source, setSource] = useLocalStorage(
        STORAGE_KEY,
        JSON.stringify(modules[0], null, 4)
    )
    const json: Enclosure = useMemo(() => {
        try {
            return JSON.parse(source)
        } catch (e) {
            console.debug(e)
            return undefined
        }
    }, [source])
    const handleFormat = () => {
        setSource(JSON.stringify(json, null, 4))
    }
    return (
        <Grid spacing={1} container>
            <Grid item xs={12}>
                <Button
                    variant="outlined"
                    onClick={handleFormat}
                    disabled={!json}
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
                <EnclosureGenerator module={json} color="#444" />
            </Grid>
        </Grid>
    )
}

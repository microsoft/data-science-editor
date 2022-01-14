import React, { ReactNode, useContext } from "react"
import { Box, Grid, Tooltip, Button } from "@mui/material"
import DownloadIcon from "@mui/icons-material/GetApp"
// tslint:disable-next-line: no-submodule-imports match-default-export-name

import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import { PointerBoundary } from "../PointerBoundary"

import WorkspaceContext from "../../WorkspaceContext"

export interface RecordingBlockFieldValue {
    numSamples: number
    timestamp: number
    inputTypes: string[]
}

function RecordingParameterWidget(props: {
    initFieldValue: RecordingBlockFieldValue
}) {
    const { initFieldValue } = props
    const { sourceBlock } = useContext(WorkspaceContext)

    const { numSamples, inputTypes } = initFieldValue

    const handleDownloadDataSet = () => {
        console.log("Download recording")
        sourceBlock.data = "click.download"
    }

    return (
        <PointerBoundary>
            <Grid container spacing={1} direction={"column"}>
                <Grid item>
                    <Box color="text.secondary">
                        Total samples: {numSamples} <br />
                        Input type(s):{" "}
                        {inputTypes.length ? inputTypes.join(", ") : "none"}
                    </Box>
                </Grid>
                <Grid item style={{ display: "inline-flex" }}>
                    <Tooltip title="Download recording as csv file">
                        <Button
                            onClick={handleDownloadDataSet}
                            startIcon={<DownloadIcon />}
                            variant="outlined"
                            size="small"
                        >
                            Download
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
        </PointerBoundary>
    )
}

export default class RecordingBlockField extends ReactInlineField<RecordingBlockFieldValue> {
    static KEY = "recording_block_field_key"

    constructor(value: string, previousValue?: RecordingBlockFieldValue) {
        super(value)
        if (previousValue)
            this.value = { ...this.defaultValue, ...previousValue }
    }

    static fromJson(options: ReactFieldJSON) {
        return new RecordingBlockField(options?.value)
    }

    /* This default value is specified here and in modelblockdsl.ts */
    get defaultValue() {
        return {
            numSamples: 0,
            timestamp: 0,
            inputTypes: [],
        }
    }

    getText_() {
        const { numSamples } = this.value

        return `${numSamples} sample(s)`
    }

    renderInlineField(): ReactNode {
        return (
            <RecordingParameterWidget
                initFieldValue={this.value as RecordingBlockFieldValue}
            />
        )
    }
}

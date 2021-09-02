import React, { lazy, useContext } from "react"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
} from "@material-ui/core"
import DownloadIcon from "@material-ui/icons/GetApp"
import IconButtonWithTooltip from "../../ui/IconButtonWithTooltip"
import Suspense from "../../ui/Suspense"

import ServiceManagerContext from "../../ServiceManagerContext"

import MBModel from "../../model-editor/MBModel"

import { PointerBoundary } from "../../blockly/fields/PointerBoundary"

const ModelSummaryDropdown = lazy(
    () => import("../../model-editor/components/ModelSummaryDropdown")
)
const ModelOutput = lazy(() => import("../../model-editor/ModelOutput"))

export default function TrainModelDialog(props: {
    classes: any
    chartPalette: string[]
    open: boolean
    onDone: () => void
    model: MBModel
}) {
    const { classes, chartPalette, open, onDone, model } = props

    const chartProps = {
        CHART_WIDTH: 300,
        CHART_HEIGHT: 300,
        MARK_SIZE: 75,
        TOOLTIP_NUM_FORMAT: "0.2f",
        PALETTE: chartPalette,
    }
    const { fileStorage } = useContext(ServiceManagerContext)

    /* For interface controls */
    const handleCancel = () => {
        // close the modal
        onDone()
    }
    const handleDownloadModel = () => {
        // TODO also download arm model (as a zip file?)
        fileStorage.saveText(`${model.name}.json`, JSON.stringify(model))
    }

    return (
        <PointerBoundary>
            <Dialog
                open={open}
                onClose={handleCancel}
                fullWidth={true}
                maxWidth={"md"}
            >
                <DialogContent>
                    <Grid container direction={"column"}>
                        <Grid item>
                            <h3>
                                Trained Model
                                <IconButtonWithTooltip
                                    onClick={handleDownloadModel}
                                    title="Download trained model"
                                >
                                    <DownloadIcon />
                                </IconButtonWithTooltip>
                            </h3>
                            <Suspense>
                                <ModelSummaryDropdown
                                    reactStyle={classes}
                                    dataset={undefined}
                                    model={model}
                                />
                            </Suspense>
                        </Grid>
                        <Grid item>
                            <ModelOutput
                                chartProps={chartProps}
                                reactStyle={classes}
                                chartPalette={chartPalette}
                                model={model}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={false}
                        onClick={handleCancel}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </PointerBoundary>
    )
}

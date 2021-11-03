import React, { lazy, useContext } from "react"

import {
    Button,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/GetApp"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import IconButtonWithTooltip from "../../ui/IconButtonWithTooltip"

import ClassDataSetGrid from "../../ClassDataSetGrid"

import MBDataSet from "../../model-editor/MBDataSet"
import Suspense from "../../ui/Suspense"

import ServiceManagerContext from "../../ServiceManagerContext"

const DataSetPlot = lazy(
    () => import("../../model-editor/components/DataSetPlot")
)

export default function BlocklyViewDataDialog(props: {
    classes: any
    chartPalette: string[]
    open: boolean
    onDone: () => void
    dataset: MBDataSet
}) {
    const { classes, chartPalette, open, onDone, dataset } = props
    const chartProps = {
        CHART_WIDTH: 300,
        CHART_HEIGHT: 300,
        MARK_SIZE: 75,
        TOOLTIP_NUM_FORMAT: "0.2f",
        PALETTE: chartPalette,
    }

    const { fileStorage } = useContext(ServiceManagerContext)
    const handleDownloadDataSet = async () => {
        fileStorage.saveText(`${dataset.name}.csv`, dataset.toCSV())
    }

    /* For interface controls */
    const handleDone = () => {
        // close the modal
        onDone()
    }

    return (
        <Dialog
            open={open}
            onClose={handleDone}
            fullWidth={true}
            maxWidth={"md"}
        >
            <DialogContent>
                <Grid container direction={"column"}>
                    <Grid item>
                        <h2>
                            Viewing {dataset.name}
                            <IconButtonWithTooltip
                                onClick={handleDownloadDataSet}
                                title="Download all recording data"
                                disabled={dataset.totalRecordings == 0}
                            >
                                <DownloadIcon />
                            </IconButtonWithTooltip>
                        </h2>
                        <div key="recordedData">
                            {dataset.totalRecordings ? (
                                <div key="recordings">
                                    <p>
                                        Input type(s):{" "}
                                        {dataset.inputTypes.join(",")}{" "}
                                    </p>
                                    {dataset.labels.map(classLabel => (
                                        <ClassDataSetGrid
                                            key={"dataset-" + classLabel}
                                            label={classLabel}
                                            tables={dataset.getRecordingsWithLabel(
                                                classLabel
                                            )}
                                            handleDeleteTable={undefined}
                                        />
                                    ))}
                                    <h3>Dataset plot</h3>
                                    <Suspense>
                                        <DataSetPlot
                                            chartProps={chartProps}
                                            reactStyle={classes}
                                            dataset={dataset}
                                            predictedLabels={undefined}
                                            timestamp={undefined}
                                        />
                                    </Suspense>
                                </div>
                            ) : (
                                <p>Empty</p>
                            )}
                        </div>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleDone}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

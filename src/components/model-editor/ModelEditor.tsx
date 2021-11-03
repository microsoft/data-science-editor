import React, { useState } from "react"
import { styled } from "@mui/material/styles"
import { Box, Tabs, Tab } from "@mui/material"
import TabPanel from "../ui/TabPanel"

import useChartPalette from "../useChartPalette"

import CollectData from "./CollectData"
import TrainModel from "./TrainModel"
import ModelOutput from "./ModelOutput"

import MBDataSet from "./MBDataSet"
import MBModel from "./MBModel"

const PREFIX = "DATASET_NAME"

const classes = {
    root: `${PREFIX}-root`,
    grow: `${PREFIX}-grow`,
    field: `${PREFIX}-field`,
    segment: `${PREFIX}-segment`,
    row: `${PREFIX}-row`,
    buttons: `${PREFIX}-buttons`,
    trend: `${PREFIX}-trend`,
    vmiddle: `${PREFIX}-vmiddle`,
}

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.root}`]: {
        marginBottom: theme.spacing(1),
    },

    [`& .${classes.grow}`]: {
        flexGrow: 1,
    },

    [`& .${classes.field}`]: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1.5),
        display: "inline-flex",
        width: theme.spacing(35),
    },

    [`& .${classes.segment}`]: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.row}`]: {
        marginBottom: theme.spacing(0.5),
    },

    [`& .${classes.buttons}`]: {
        display: "inline-flex",
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.trend}`]: {
        width: theme.spacing(10),
    },

    [`& .${classes.vmiddle}`]: {
        verticalAlign: "middle",
    },
}))

const MODEL_EDITOR = "model_editor" // create prefix for model editor page
const MODEL_NAME = MODEL_EDITOR + "-model"
export const DATASET_NAME = MODEL_EDITOR + "-dataset"
export const MODEL_EDITOR_STORAGE_KEY = "model-editor-data-json"

function getDataSetFromLocalStorage() {
    // check local storage for recording
    const storedDataJSON = localStorage.getItem(MODEL_EDITOR_STORAGE_KEY)
    if (storedDataJSON) {
        const modelEditorData = JSON.parse(storedDataJSON)
        if (modelEditorData["dataset"])
            return MBDataSet.createFromFile(
                DATASET_NAME,
                modelEditorData["dataset"]
            )
    }
    return new MBDataSet(DATASET_NAME)
}

function getModelFromLocalStorage() {
    // check local storage for saved model
    const storedDataJSON = localStorage.getItem(MODEL_EDITOR_STORAGE_KEY)
    if (storedDataJSON) {
        const modelEditorData = JSON.parse(storedDataJSON)
        if (modelEditorData["model"])
            return MBModel.createFromFile(modelEditorData["model"])
    }

    const newModel = new MBModel(MODEL_NAME)
    return newModel
}

function getTabFromLocalStorage() {
    // check local storage for saved model
    const storedDataJSON = localStorage.getItem(MODEL_EDITOR_STORAGE_KEY)
    if (storedDataJSON) {
        const modelEditorData = JSON.parse(storedDataJSON)
        if (modelEditorData["tab"]) return modelEditorData["tab"]
    }
    return 0
}

export default function ModelPlayground() {
    const chartPalette = useChartPalette()
    const chartProps = {
        CHART_WIDTH: 300,
        CHART_HEIGHT: 300,
        MARK_SIZE: 75,
        TOOLTIP_NUM_FORMAT: "0.2f",
        PALETTE: chartPalette,
    }

    const [dataset, setDataSet] = useState<MBDataSet>(
        getDataSetFromLocalStorage
    )
    const [tfModel, setTFModel] = useState<MBModel>(getModelFromLocalStorage)
    const [tab, setTab] = useState<number>(getTabFromLocalStorage)

    /* Data and interface management */
    const handleTabChange = (
        event: React.ChangeEvent<unknown>,
        newTab: number
    ) => {
        const storedDataJSON = localStorage.getItem(MODEL_EDITOR_STORAGE_KEY)
        let modelEditorData
        if (storedDataJSON) {
            // keep previous dataset and model data
            modelEditorData = JSON.parse(storedDataJSON)
            modelEditorData["tab"] = newTab
        } else {
            modelEditorData = {
                dataset: undefined,
                model: undefined,
                tab: newTab,
            }
        }

        // save JSON string in local storage
        localStorage.setItem(
            MODEL_EDITOR_STORAGE_KEY,
            JSON.stringify(modelEditorData)
        )
        setTab(newTab)
    }

    const handleDataChange = newDataSet => {
        const storedDataJSON = localStorage.getItem(MODEL_EDITOR_STORAGE_KEY)

        let modelEditorData
        if (storedDataJSON) {
            // keep previous model and tab data
            modelEditorData = JSON.parse(storedDataJSON)
            modelEditorData["dataset"] = newDataSet

            // if dataset is changed, model should be reset too
            modelEditorData["model"] = new MBModel(MODEL_NAME)
            setTFModel(new MBModel(MODEL_NAME))
        } else {
            modelEditorData = {
                dataset: newDataSet,
                model: undefined,
                tab: 0,
            }
        }
        // save JSON string in local storage
        localStorage.setItem(
            MODEL_EDITOR_STORAGE_KEY,
            JSON.stringify(modelEditorData)
        )
        setDataSet(newDataSet)
    }

    const handleModelChange = async newModel => {
        const storedDataJSON = localStorage.getItem(MODEL_EDITOR_STORAGE_KEY)
        let modelEditorData
        if (storedDataJSON) {
            // keep previous dataset and tab data
            modelEditorData = JSON.parse(storedDataJSON)
            modelEditorData["model"] = newModel
        } else {
            modelEditorData = {
                dataset: undefined,
                model: newModel,
                tab: 0,
            }
        }
        // save JSON string in local storage
        localStorage.setItem(
            MODEL_EDITOR_STORAGE_KEY,
            JSON.stringify(modelEditorData)
        )

        setTFModel(newModel)
    }

    const nextTab = () => {
        if (tab == 0 && dataset.labels.length >= 2) {
            setTab(1)
        } else if (tab == 1 && tfModel.status == "trained") {
            setTab(2)
        }
    }

    return (
        <StyledBox mb={2}>
            <h1>ML Model Editor</h1>
            <p>
                This page allows you to collect data from Jacdac sensors and use
                them to train a neural network model that does classification.
            </p>

            <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="View specification formats"
            >
                <Tab label={`1 - Collect Data`} />
                <Tab
                    label={`2 - Train Model`}
                    disabled={dataset.labels.length < 2}
                />
                <Tab
                    label={`3 - Test Model`}
                    disabled={
                        dataset.labels.length < 2 ||
                        tfModel.status !== "trained"
                    }
                />
            </Tabs>
            <TabPanel value={tab} index={0}>
                <CollectData
                    chartProps={chartProps}
                    reactStyle={classes}
                    chartPalette={chartPalette}
                    dataset={dataset}
                    onChange={handleDataChange}
                    onNext={nextTab}
                />
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <TrainModel
                    chartProps={chartProps}
                    reactStyle={classes}
                    dataset={dataset}
                    model={tfModel}
                    onChange={handleModelChange}
                    onNext={nextTab}
                />
            </TabPanel>
            <TabPanel value={tab} index={2}>
                <ModelOutput
                    chartProps={chartProps}
                    reactStyle={classes}
                    chartPalette={chartPalette}
                    model={tfModel}
                />
            </TabPanel>
        </StyledBox>
    )
}

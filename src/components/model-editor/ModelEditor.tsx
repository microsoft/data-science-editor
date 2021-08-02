import React, { useState, useEffect } from "react"
import { createStyles, Box, Tabs, Tab } from "@material-ui/core"
import TabPanel from "../ui/TabPanel"

import { makeStyles, Theme } from "@material-ui/core/styles"
import useChartPalette from "../useChartPalette"

import CollectData from "./CollectData"
import TrainModel from "./TrainModel"
import ModelOutput from "./ModelOutput"

import ModelDataSet from "./ModelDataSet"
import MBModel from "./MBModel"

//Dashboard.tsx

const MODEL_EDITOR = "model_editor" // create prefix for model editor page
const MODEL_NAME = MODEL_EDITOR + "-model"
export const MODEL_EDITOR_STORAGE_KEY = "model-editor-data-json"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            marginBottom: theme.spacing(1),
        },
        grow: {
            flexGrow: 1,
        },
        field: {
            marginRight: theme.spacing(1),
            marginBottom: theme.spacing(1.5),
            display: "inline-flex",
            width: theme.spacing(35),
        },
        segment: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        row: {
            marginBottom: theme.spacing(0.5),
        },
        buttons: {
            display: "inline-flex",
            marginRight: theme.spacing(1),
            marginBottom: theme.spacing(2),
        },
        trend: {
            width: theme.spacing(10),
        },
        vmiddle: {
            verticalAlign: "middle",
        },
    })
)

export default function ModelPlayground() {
    const classes = useStyles()
    const chartPalette = useChartPalette()

    const [dataset, setDataSet] = useState<ModelDataSet>(new ModelDataSet())
    const [tfModel, setTFModel] = useState<MBModel>(new MBModel(MODEL_NAME))
    const [tab, setTab] = useState<number>(0)

    const [pageReady, setPageReady] = useState(false)
    useEffect(() => {
        if (!pageReady) {
            const storedDataJSON = localStorage.getItem(
                MODEL_EDITOR_STORAGE_KEY
            )
            if (storedDataJSON) {
                const modelEditorData = JSON.parse(storedDataJSON)
                if (modelEditorData["dataset"])
                    setDataSet(
                        ModelDataSet.createFromFile(modelEditorData["dataset"])
                    )
                if (modelEditorData["tab"]) setTab(modelEditorData["tab"])
                if (modelEditorData["model"]) {
                    MBModel.createFromFile(modelEditorData["model"]).then(
                        storedModel => {
                            setTFModel(storedModel)
                            setPageReady(true)
                        }
                    )
                } else {
                    setPageReady(true)
                }
            } else setPageReady(true)
        }
    }, [])

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
        console.log("Randi updated data from tab 0: ", newDataSet)

        const storedDataJSON = localStorage.getItem(MODEL_EDITOR_STORAGE_KEY)
        let modelEditorData
        if (storedDataJSON) {
            // keep previous model and tab data
            modelEditorData = JSON.parse(storedDataJSON)
            modelEditorData["dataset"] = newDataSet
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
        console.log("Randi updated model from tab 1: ", newModel)

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
        console.log("Randi storing new model JSON: ", newModel)
        localStorage.setItem(
            MODEL_EDITOR_STORAGE_KEY,
            JSON.stringify(modelEditorData)
        )

        setTFModel(newModel)
    }

    const nextTab = () => {
        if (tab == 0 && dataset.labels.length >= 2) {
            setTab(1)
        } else if (tab == 1 && tfModel.status == "completed") {
            setTab(2)
        }
    }

    if (!pageReady) return null
    return (
        <Box mb={2}>
            <h1>ML Model Creator</h1>
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
                        tfModel.status !== "completed"
                    }
                />
            </Tabs>
            <TabPanel value={tab} index={0}>
                <CollectData
                    reactStyle={classes}
                    chartPalette={chartPalette}
                    dataset={dataset}
                    onChange={handleDataChange}
                    onNext={nextTab}
                />
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <TrainModel
                    reactStyle={classes}
                    dataset={dataset}
                    model={tfModel}
                    onChange={handleModelChange}
                    onNext={nextTab}
                />
            </TabPanel>
            <TabPanel value={tab} index={2}>
                <ModelOutput
                    reactStyle={classes}
                    chartPalette={chartPalette}
                    model={tfModel}
                />
            </TabPanel>
        </Box>
    )
}

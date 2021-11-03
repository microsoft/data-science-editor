import React, { ReactNode, useContext } from "react"
import { styled } from "@mui/material/styles"
import { Button, Grid, Tooltip } from "@mui/material"
import AutorenewIcon from "@mui/icons-material/Autorenew"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DownloadIcon from "@mui/icons-material/GetApp"
// tslint:disable-next-line: no-submodule-imports match-default-export-name

import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import WorkspaceContext from "../../WorkspaceContext"

const PREFIX = "NeuralNetworkBlockButtons"

const classes = {
    numberField: `${PREFIX}-numberField`,
    buttonContainer: `${PREFIX}-buttonContainer`,
}

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.numberField}`]: {
        marginBottom: theme.spacing(1),
    },

    [`& .${classes.buttonContainer}`]: {
        display: "inline-flex",
        width: 300,
    },
}))

function NeuralNetworkButtonWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)

    const handleTrainModel = () => {
        console.log("Open NN classifier modal")
        sourceBlock.data = "click.train"
    }

    const handleDownloadModel = () => {
        console.log("Download model")
        sourceBlock.data = "click.download"
    }

    return (
        <Grid container spacing={1} direction={"row"}>
            <Grid item className={classes.buttonContainer}>
                <Tooltip title="Open modal to view and run classifier">
                    <Button
                        onClick={handleTrainModel}
                        startIcon={<AutorenewIcon />}
                        variant="outlined"
                        size="small"
                    >
                        Train
                    </Button>
                </Tooltip>
                &ensp;
                <Tooltip title="Download model JSON and weights file">
                    <Button
                        onClick={handleDownloadModel}
                        startIcon={<DownloadIcon />}
                        variant="outlined"
                        size="small"
                    >
                        Download
                    </Button>
                </Tooltip>
            </Grid>
        </Grid>
    )
}

export default class NeuralNetworkBlockButtons extends ReactInlineField {
    static KEY = "nn_block_buttons_key"

    constructor(value: string) {
        super(value)
    }

    static fromJson(options: ReactFieldJSON) {
        return new NeuralNetworkBlockButtons(options?.value)
    }

    getText_() {
        return `nn`
    }

    renderInlineField(): ReactNode {
        return (
            <Root>
                <NeuralNetworkButtonWidget />
            </Root>
        )
    }
}

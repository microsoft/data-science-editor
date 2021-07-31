import React, { useContext, useState } from "react"

import { Grid } from "@material-ui/core"
import AddCircleIcon from "@material-ui/icons/AddCircleOutline"
import RemoveCircleIcon from "@material-ui/icons/RemoveCircleOutline"
import IconButtonWithTooltip from "../../../ui/IconButtonWithTooltip"

import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import ReactParameterField from "../ReactParameterField"
import WorkspaceContext from "../../WorkspaceContext"

function ExpandIconWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)

    const initializeParametersVisible = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<unknown>
        if (parameterField) return parameterField.areParametersVisible()

        return false
    }
    const [parametersVisible, setParametersVisible] = useState(
        initializeParametersVisible()
    )

    const handleExpandBlock = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<unknown>
        if (parameterField) {
            parameterField.setParametersVisible(!parametersVisible)
            // make sure parameters visible is aligned with the block
            setParametersVisible(parameterField.areParametersVisible())
        }
    }

    return (
        <Grid container spacing={1}>
            <Grid item>
                <IconButtonWithTooltip
                    style={{ backgroundColor: "transparent" }}
                    onClick={handleExpandBlock}
                    title="Expand dataset block to see all dataset info"
                >
                    {parametersVisible ? (
                        <RemoveCircleIcon />
                    ) : (
                        <AddCircleIcon />
                    )}
                </IconButtonWithTooltip>
            </Grid>
        </Grid>
    )
}

export default class ExpandModelBlockField extends ReactInlineField {
    static KEY = "model_field_key"

    constructor(value: string) {
        super(value)
    }

    protected createContainer(): HTMLDivElement {
        const c = document.createElement("div")
        c.style.display = "inline-block"
        c.style.minWidth = "2rem"
        return c
    }

    static fromJson(options: ReactFieldJSON) {
        return new ExpandModelBlockField(options?.value)
    }

    getText_() {
        return ","
    }

    renderInlineField() {
        return <ExpandIconWidget />
    }
}

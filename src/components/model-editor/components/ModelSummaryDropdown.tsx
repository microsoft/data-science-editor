import React from "react"
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Grid,
} from "@material-ui/core"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
// tslint:disable-next-line: no-submodule-imports match-default-export-name

import ModelSummary from "./ModelSummary"
import MBDataSet from "../MBDataSet"
import MBModel from "../MBModel"

export default function ModelSummaryDropdown(props: {
    reactStyle: any
    dataset: MBDataSet
    model: MBModel
}) {
    const { dataset, model } = props
    const classes = props.reactStyle

    const [expanded, setExpanded] = React.useState<string | false>(false)
    const handleExpandedSummaryChange =
        (panel: string) =>
        (event: React.ChangeEvent<unknown>, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false)
        }

    return (
        <Accordion
            expanded={expanded === "modelSummary"}
            onChange={handleExpandedSummaryChange("modelSummary")}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div>
                    {expanded == "modelSummary" ? (
                        <h2> Summary </h2>
                    ) : (
                        <span>
                            Classes: {model.labels.join(", ")} <br />
                            Training Status: {model.status} <br />
                        </span>
                    )}
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container direction="column" spacing={1}>
                    <Grid item xs={12}>
                        <ModelSummary
                            reactStyle={classes}
                            dataset={dataset}
                            model={model}
                        />
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
    )
}

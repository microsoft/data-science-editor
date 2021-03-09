import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { units } from "../../jacdac-ts/jacdac-spec/spectool/jdspec"
import PaperBox from "./ui/PaperBox";

export default function SpecificationUnitList() {
    const u = units();
    return <PaperBox><Grid container spacing={1}>
        {u.map(kv => <Grid item xs={6} sm={4} md={3} lg={2} xl={1} key={kv.name}>
            <Typography variant="body1">{kv.name}</Typography>
            <Typography variant="caption">{kv.description}</Typography>
        </Grid>)}
    </Grid>
    </PaperBox>
}
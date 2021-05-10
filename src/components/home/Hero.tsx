import React from "react"
import { Box, Grid, Typography } from "@material-ui/core"
import { Button } from "gatsby-theme-material-ui"
import { StaticImage } from "gatsby-plugin-image"

export default function Hero() {
    return (
        <Box py={3}>
            <Grid container
                direction="row"
                alignContent="center"
                alignItems="center"
            >
                <Grid item xs>
                    <Grid
                        container
                        spacing={2}
                        direction="column"
                        alignContent="flex-end"
                        alignItems="flex-end"
                    >
                        <Grid item xs={12}>
                            <Typography variant="h1">Jacdac</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h2" style={({ textAlign: "right" })}>plug-and-play for microcontrollers</Typography>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="primary" to="/dashboard/">
                                Dashboard
                    </Button>
                        </Grid>
                    </Grid>

                </Grid>
                <Grid item xs={12} md={6}>
                    <StaticImage src="./manymodulestogether.png" alt="Many Modules Together" />
                </Grid>
            </Grid>
        </Box>
    )
}

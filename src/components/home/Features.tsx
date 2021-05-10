import React, { ReactNode } from "react"
import { Box, Grid } from "@material-ui/core"

interface FeatureProps {
    title: string
    image: ReactNode
}

function Feature(props: FeatureProps) {
    const { title, image } = props
    return (
        <Grid item xs={12}>
            <Grid container spacing={1}>
                <Grid item sm={6}>
                    <h3>{title}</h3>
                </Grid>
                <Grid item>{image}</Grid>
            </Grid>
        </Grid>
    )
}

export default function Features() {
    const features = [
        {
            title: "Bus topology",
            image: <span>this is an image</span>,
        },
    ]
    return (
        <Box py={3}>
            <Grid
                container
                spacing={2}
                alignContent="center"
                alignItems="center"
            >
                {features.map(feature => (
                    <Feature key={feature.title} {...feature} />
                ))}
            </Grid>
        </Box>
    )
}

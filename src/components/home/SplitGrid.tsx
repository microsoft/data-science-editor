import React, { ReactNode } from "react"
import { Box, Grid, Typography } from "@material-ui/core"
import { Button } from "gatsby-theme-material-ui"

export default function SplitGrid(props: {
    right?: boolean
    title?: string
    description?: string
    subtitle?: string
    caption?: string
    buttonText?: string
    buttonUrl?: string
    image: ReactNode
    imageColumns?: number
}) {
    const { right, title, subtitle, description, image, caption, buttonText, buttonUrl, imageColumns = 5 } = props

    const textItem = (
        <Grid item xs>
            <Grid
                container
                spacing={2}
                direction="column"
                alignContent="flex-start"
                alignItems="flex-start"
            >
                {title && (
                    <Grid item xs={12}>
                        <Typography variant="h1">{title}</Typography>
                    </Grid>
                )}
                {subtitle && (
                    <Grid item xs={12}>
                        <Typography variant="h2">{subtitle}</Typography>
                    </Grid>
                )}
                {description && (
                    <Grid item xs={12}>
                        <Typography variant="body1">{description}</Typography>
                    </Grid>
                )}
                {caption && (
                    <Grid item xs={12}>
                        <Typography variant="caption">{caption}</Typography>
                    </Grid>
                )}
                {buttonUrl && (
                    <Grid item xs={12}>
                        <Button variant="outlined" to={buttonUrl}>{buttonText || "Learn more"}</Button>
                    </Grid>
                )}
            </Grid>
        </Grid>
    )

    const imageItem = (
        <Grid item xs={12} md={imageColumns}>
            {image}
        </Grid>
    )

    return (
        <Box py={8}>
            <Grid
                container
                direction="row"
                alignContent="center"
                alignItems="center"
                spacing={2}
            >
                {right ? imageItem : textItem}
                {right ? textItem : imageItem}
            </Grid>
        </Box>
    )
}

import {
    createStyles,
    Grid,
    makeStyles,
    Typography,
    Theme,
} from "@material-ui/core"
import { Button, Link } from "gatsby-theme-material-ui"
import React, { ReactNode } from "react"
import clsx from "clsx"

export interface FeatureItemProps {
    startImage?: ReactNode
    title?: string
    subtitle?: string
    description?: string
    caption?: string
    buttonText?: string
    centered?: boolean
    buttonColor?: "primary" | "secondary" | "default"
    buttonUrl?: string
    buttonVariant?: "outlined" | "contained" | "link"
    image?: ReactNode
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        centered: {
            textAlign: "center",
        },
        description: {
            fontSize: theme.typography.fontSize * 1.5,
        },
    })
)

export default function FeatureItem(props: FeatureItemProps) {
    const {
        title,
        subtitle,
        description,
        buttonText,
        buttonUrl,
        buttonColor = "primary",
        buttonVariant = "contained",
        startImage,
        caption,
        image,
        centered,
    } = props
    const classes = useStyles()
    const centeredCls = centered && classes.centered
    const cls = centeredCls
    return (
        <>
            {startImage && (
                <Grid item xs={12}>
                    {startImage}
                </Grid>
            )}
            {title && (
                <Grid item xs={12}>
                    <Typography variant="h1" className={cls}>
                        {title}
                    </Typography>
                </Grid>
            )}
            {subtitle && (
                <Grid item xs={12}>
                    <Typography variant="h2" className={cls}>
                        {subtitle}
                    </Typography>
                </Grid>
            )}
            {description && (
                <Grid item xs={12}>
                    <Typography
                        variant="body1"
                        className={clsx(cls, classes.description)}
                    >
                        {description}
                    </Typography>
                </Grid>
            )}
            {caption && (
                <Grid item xs={12}>
                    <Typography variant="body2" className={cls}>
                        {caption}
                    </Typography>
                </Grid>
            )}
            {buttonUrl && buttonText && (
                <Grid item xs={12}>
                    {buttonVariant === "link" ? (
                        <Link to={buttonUrl} className={cls}>
                            {buttonText}
                            {" >"}
                        </Link>
                    ) : (
                        <Button
                            variant="contained"
                            color={buttonColor}
                            to={buttonUrl}
                            className={cls}
                        >
                            {buttonText}
                        </Button>
                    )}
                </Grid>
            )}
            {image && (
                <Grid item xs={12} className={cls}>
                    {image}
                </Grid>
            )}
        </>
    )
}

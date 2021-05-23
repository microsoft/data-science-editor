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
    subtitle2?: string
    subtitle3?: string
    description?: string
    caption?: string
    buttonText?: string
    centered?: boolean
    buttonColor?: "primary" | "secondary" | "default"
    buttonUrl?: string
    buttonVariant?: "outlined" | "contained" | "link"
    onButtonClick?: () => void
    image?: ReactNode
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        centered: {
            textAlign: "center",
        },
        description: {
            fontSize: theme.typography.fontSize * 1.8,
        },
        caption: {
            fontSize: theme.typography.fontSize,
        },
        button: {
            fontSize: theme.typography.fontSize * 1.5,
        },
    })
)

export default function FeatureItem(props: FeatureItemProps) {
    const {
        title,
        subtitle,
        subtitle2,
        subtitle3,
        description,
        buttonText,
        buttonUrl,
        buttonColor = "primary",
        buttonVariant = "contained",
        startImage,
        caption,
        image,
        centered,
        onButtonClick,
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
            {subtitle2 && (
                <Grid item xs={12}>
                    <Typography variant="h3" className={cls}>
                        {subtitle2}
                    </Typography>
                </Grid>
            )}
            {subtitle3 && (
                <Grid item xs={12}>
                    <Typography variant="h4" className={cls}>
                        {subtitle3}
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
                    <Typography
                        variant="subtitle2"
                        className={clsx(cls, classes.caption)}
                    >
                        {caption}
                    </Typography>
                </Grid>
            )}
            {(buttonUrl || onButtonClick) && buttonText && (
                <Grid item xs={12} className={clsx(cls, classes.button)}>
                    {buttonVariant === "link" ? (
                        <Link
                            style={{ cursor: "pointer" }}
                            to={buttonUrl}
                            onClick={onButtonClick}
                        >
                            {buttonText}
                            {" >"}
                        </Link>
                    ) : (
                        <Button
                            variant="contained"
                            color={buttonColor}
                            to={buttonUrl}
                            onClick={onButtonClick}
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

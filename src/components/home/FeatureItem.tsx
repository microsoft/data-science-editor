import { Grid, Typography, Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Button, Link } from "gatsby-theme-material-ui"
import React, { ReactNode } from "react"
import clsx from "clsx"
import JacdacIcon from "../icons/JacdacIcon"

const PREFIX = "FeatureItem"

const classes = {
    centered: `${PREFIX}-centered`,
    description: `${PREFIX}-description`,
    caption: `${PREFIX}-caption`,
    button: `${PREFIX}-button`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.centered}`]: {
        textAlign: "center",
    },

    [`& .${classes.description}`]: {
        fontSize: theme.typography.fontSize * 1.8,
    },

    [`& .${classes.caption}`]: {
        fontSize: theme.typography.fontSize,
    },

    [`& .${classes.button}`]: {
        fontSize: theme.typography.fontSize * 1.5,
    },
}))

export interface FeatureItemProps {
    startImage?: ReactNode
    title?: ReactNode
    subtitle?: string
    subtitle2?: string
    subtitle3?: string
    description?: string
    caption?: string
    buttonText?: string
    centered?: boolean
    buttonColor?: "primary" | "secondary" | "inherit"
    buttonUrl?: string
    buttonVariant?: "outlined" | "contained" | "link"
    onButtonClick?: () => void
    image?: ReactNode
    hideJacdacIcon?: boolean
}

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
        hideJacdacIcon,
    } = props

    const centeredCls = centered && classes.centered
    const cls = centeredCls
    return (
        <Root>
            {startImage && (
                <Grid item xs={12}>
                    <Box mb={2}>{startImage}</Box>
                </Grid>
            )}
            {title && (
                <Grid item xs={12}>
                    <Typography variant="h1" className={cls}>
                        {!hideJacdacIcon && (
                            <JacdacIcon
                                fontSize="large"
                                style={{
                                    fontSize: "4rem",
                                    verticalAlign: "middle",
                                }}
                            />
                        )}
                        <span style={{ fontWeight: "bold" }}>{title}</span>
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
                        <Box mt={2}>
                            <Button
                                variant="contained"
                                color={buttonColor}
                                to={buttonUrl}
                                onClick={onButtonClick}
                            >
                                {buttonText}
                            </Button>
                        </Box>
                    )}
                </Grid>
            )}
            {image && (
                <Grid item xs={12} className={cls}>
                    {image}
                </Grid>
            )}
        </Root>
    )
}

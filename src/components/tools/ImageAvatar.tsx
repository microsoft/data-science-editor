import { Avatar } from "@mui/material"
import { styled } from "@mui/material/styles"
import React from "react"

const PREFIX = "ImageAvatar"
const classes = {
    img: `${PREFIX}-img`,
    small: `${PREFIX}-small`,
    large: `${PREFIX}-large`,
}

const StyledAvatar = styled("span")(({ theme }) => ({
    [`& .${classes.img}`]: {
        marginTop: "58%",
    },

    [`& .${classes.small}`]: {
        width: theme.spacing(2),
        height: theme.spacing(2),
        marginRight: theme.spacing(0.5),
    },

    [`& .${classes.large}`]: {
        width: theme.spacing(7),
        height: theme.spacing(7),
        marginRight: theme.spacing(1),
    },
}))

export default function ImageAvatar(props: {
    alt: string
    src: string
    size?: "small" | "large"
    avatar?: boolean
}) {
    const { src, alt, size, avatar } = props

    const sizeClassName =
        size === "small"
            ? classes.small
            : size === "large"
            ? classes.large
            : undefined
    return (
        <StyledAvatar>
            <Avatar
                className={sizeClassName}
                alt={alt}
                src={src}
                classes={{
                    img: avatar ? classes.img : undefined,
                }}
            />
        </StyledAvatar>
    )
}

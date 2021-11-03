import { CardMedia, CardMediaProps } from "@mui/material"
import { styled } from "@mui/material/styles"
import React from "react"

const PREFIX = "CardMediaWithSkeleton"

const classes = {
    media: `${PREFIX}-media`,
}

const StyledCardMedia = styled(CardMedia)(() => ({
    [`& .${classes.media}`]: {
        height: 0,
        paddingTop: "75%", // 4:3
    },
}))

export default function CardMediaWithSkeleton(props: CardMediaProps) {
    const { image, src, className, ...others } = props

    const hasImage = !!image || !!src
    if (!hasImage) return null

    return (
        <StyledCardMedia
            className={className || classes.media}
            {...others}
            image={image}
            src={src}
        />
    )
}

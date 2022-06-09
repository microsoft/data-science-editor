import { CardMedia, CardMediaProps, Skeleton } from "@mui/material"
import React from "react"

export default function CardMediaWithSkeleton(
    props: { aspectRatio?: string | number; title: string } & CardMediaProps
) {
    const { image, src, aspectRatio = "4 / 3", title } = props
    const hasImage = !!image || !!src
    if (!hasImage) return <Skeleton sx={{ aspectRatio }} width="100%" />

    return (
        <CardMedia
            component="img"
            image={image}
            src={src}
            alt={title}
            sx={{ aspectRatio }}
        />
    )
}

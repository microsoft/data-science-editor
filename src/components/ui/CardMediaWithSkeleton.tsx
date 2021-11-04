import { CardMedia, CardMediaProps, Skeleton, useTheme } from "@mui/material"
import React from "react"

export default function CardMediaWithSkeleton(
    props: CardMediaProps & { height?: string | number }
) {
    const { image, src, height } = props
    const theme = useTheme()
    const h = height || theme.spacing(21)

    const hasImage = !!image || !!src
    if (!hasImage) return <Skeleton height={h} width="100%" />

    return <CardMedia component="img" height={h} image={image} src={src} />
}

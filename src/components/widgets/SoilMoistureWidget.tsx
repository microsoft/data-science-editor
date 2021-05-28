import React from "react"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import { useId } from "react-use-id-hook"

export default function SoilMoistureWidget(props: {
    value: number
    color: "primary" | "secondary"
    size?: string
}) {
    const { value, color, size } = props
    const { active, background, controlBackground, textProps } =
        useWidgetTheme(color)
    const clipId = useId()

    const hasValue = !isNaN(value)
    const tvalue = hasValue ? `${Math.round(value * 100)}%` : `--`

    const w = 5
    const h = 9.488
    const cm = 3.3
    const ch = (h - cm) * ((0.12 + value) / 1.12)

    return (
        <SvgWidget width={w} height={h} size={size}>
            {hasValue && (
                <defs>
                    <clipPath id={clipId}>
                        <rect x={0} y={h - ch} width={w} height={ch} />
                    </clipPath>
                </defs>
            )}
            <path
                fill={background}
                d="M4.812 7.997V.5a.5.5 0 00-.5-.5H.689a.5.5 0 00-.5.5v7.497l.503 1.491h.466l.503-1.491V3.373a.792.792 0 01.84-.791.792.792 0 01.838.79v4.625l.503 1.491h.466z"
            />
            <path
                fill={active}
                d="M4.812 7.997V.5a.5.5 0 00-.5-.5H.689a.5.5 0 00-.5.5v7.497l.503 1.491h.466l.503-1.491V3.373a.792.792 0 01.84-.791.792.792 0 01.838.79v4.625l.503 1.491h.466z"
                clipPath={`url(#${clipId})`}
            />
            <path
                fill={controlBackground}
                d="M4.075 8.548a.075.075 0 100-.15.075.075 0 100 .15zM4.425 7.281a.075.075 0 100-.15.075.075 0 100 .15zM4.425 5.948a.075.075 0 100-.15.075.075 0 100 .15zM3.725 4.614a.075.075 0 100-.15.075.075 0 100 .15zM3.725 3.948a.075.075 0 100-.15.075.075 0 100 .15zM3.725 5.281a.075.075 0 100-.15.075.075 0 100 .15zM4.425 6.614a.075.075 0 100-.15.075.075 0 100 .15zM4.425 7.948a.075.075 0 100-.15.075.075 0 100 .15zM3.725 7.281a.075.075 0 100-.15.075.075 0 100 .15zM3.725 5.948a.075.075 0 100-.15.075.075 0 100 .15zM4.425 4.614a.075.075 0 100-.15.075.075 0 100 .15zM4.425 3.948a.075.075 0 100-.15.075.075 0 100 .15zM4.425 5.281a.075.075 0 100-.15.075.075 0 100 .15zM3.725 6.614a.075.075 0 100-.15.075.075 0 100 .15zM3.725 7.948a.075.075 0 100-.15.075.075 0 100 .15zM.925 8.548a.075.075 0 100-.15.075.075 0 100 .15zM.575 7.281a.075.075 0 100-.15.075.075 0 100 .15zM.575 5.948a.075.075 0 100-.15.075.075 0 100 .15zM1.275 4.614a.075.075 0 100-.15.075.075 0 100 .15zM1.275 3.948a.075.075 0 100-.15.075.075 0 100 .15zM1.275 5.281a.075.075 0 100-.15.075.075 0 100 .15zM.575 6.614a.075.075 0 100-.15.075.075 0 100 .15zM.575 7.948a.075.075 0 100-.15.075.075 0 100 .15zM1.275 7.281a.075.075 0 100-.15.075.075 0 100 .15zM1.275 5.948a.075.075 0 100-.15.075.075 0 100 .15zM.575 4.614a.075.075 0 100-.15.075.075 0 100 .15zM.575 3.948a.075.075 0 100-.15.075.075 0 100 .15zM.575 5.281a.075.075 0 100-.15.075.075 0 100 .15zM1.275 6.614a.075.075 0 100-.15.075.075 0 100 .15zM1.275 7.948a.075.075 0 100-.15.075.075 0 100 .15z"
            />
            <text
                x={w / 2}
                y="1.4"
                fontSize="1.058"
                strokeWidth=".026"
                {...textProps}
            >
                {tvalue}
            </text>
        </SvgWidget>
    )
}

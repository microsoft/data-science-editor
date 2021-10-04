import { StaticImage } from "gatsby-plugin-image"
import React, { useContext } from "react"
import DarkModeContext from "../ui/DarkModeContext"

export default function HTML5Image(props: { icon?: boolean }) {
    const { darkMode } = useContext(DarkModeContext)
    const { icon } = props
    if (icon)
        if (darkMode === "dark")
            return (
                <StaticImage
                    width={64}
                    src="./html5-white.png"
                    alt="A Jacdac humidity module plugging into a Jacdac cable"
                />
            )
        else
            return (
                <StaticImage
                    width={64}
                    src="./html5-dark.png"
                    alt="A Jacdac humidity module plugging into a Jacdac cable"
                />
            )
    else if (darkMode === "dark")
        return (
            <StaticImage
                src="./html5-white.png"
                alt="A Jacdac humidity module plugging into a Jacdac cable"
            />
        )
    else
        return (
            <StaticImage
                src="./html5-dark.png"
                alt="A Jacdac humidity module plugging into a Jacdac cable"
            />
        )
}

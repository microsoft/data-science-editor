import { StaticImage } from "gatsby-plugin-image"
import React, { useContext } from "react"
import DarkModeContext from "../ui/DarkModeContext"

export default function HTML5Image() {
    const { darkMode } = useContext(DarkModeContext)
    if (darkMode === "dark")
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

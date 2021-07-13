import React, { useContext, useEffect } from "react"
import {
    createTheme,
    createStyles,
    responsiveFontSizes,
} from "@material-ui/core"
import ThemedLayout from "../../components/ui/ThemedLayout"
import MakeCodeEditorExtension from "../../components/makecode/MakeCodeEditorExtension"
import { makeStyles } from "@material-ui/core"
import PaperBox from "../../components/ui/PaperBox"
import DarkModeContext from "../../components/ui/DarkModeContext"

const useStyles = makeStyles(theme =>
    createStyles({
        content: {
            display: "flex",
            minHeight: "100vh",
            minWidth: "10rem",
            flexDirection: "column",
            padding: theme.spacing(3),
            transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            flexGrow: 1,
        },
    })
)

export default function MakeCodeEditorExtensionPage() {
    const { toggleDarkMode, darkModeMounted } = useContext(DarkModeContext)
    const rawTheme = createTheme({
        palette: {
            primary: {
                main: "#2e7d32",
            },
            secondary: {
                main: "#ffc400",
            },
            contrastThreshold: 5.1,
            type: "dark",
        },
    })
    const classes = useStyles()
    const theme = responsiveFontSizes(rawTheme)
    useEffect(() => {
        if (darkModeMounted) toggleDarkMode("light")
    }, [darkModeMounted])
    return (
        <ThemedLayout theme={theme}>
            <div className={classes.content}>
                <PaperBox>
                    <MakeCodeEditorExtension />
                </PaperBox>
            </div>
        </ThemedLayout>
    )
}

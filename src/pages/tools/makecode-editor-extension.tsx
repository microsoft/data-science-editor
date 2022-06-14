import React, { useContext, useEffect } from "react"
import { styled } from "@mui/material/styles"
import { createTheme, responsiveFontSizes } from "@mui/material"
import ThemedLayout from "../../components/ui/ThemedLayout"
import MakeRoleCodeEditorExtension from "../../components/makecode/MakeCodeRoleEditorExtension"
import PaperBox from "../../components/ui/PaperBox"
import DarkModeContext from "../../components/ui/DarkModeContext"
import { MakeCodeEditorExtensionProvider } from "../../components/makecode/MakeCodeEditorExtensionContext"
import MakeCodeAddExtensionBox from "../../components/makecode/MakeCodeAddExtensionBox"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"

const PREFIX = "makecode-editor-extension"

const classes = {
    content: `${PREFIX}content`,
}

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.content}`]: {
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
}))

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
            background: {
                default: "#fff",
            },
            contrastThreshold: 5.1,
            mode: "light",
        },
    })

    const theme = responsiveFontSizes(rawTheme)
    useEffect(() => {
        if (darkModeMounted) toggleDarkMode("light")
    }, [darkModeMounted])
    return (
        <Root>
            <ThemedLayout theme={theme}>
                <MakeCodeEditorExtensionProvider>
                    <div className={classes.content}>
                        <PaperBox>
                            <MakeRoleCodeEditorExtension />
                        </PaperBox>
                        {Flags.diagnostics && (
                            <PaperBox>
                                <MakeCodeAddExtensionBox />
                            </PaperBox>
                        )}
                    </div>
                </MakeCodeEditorExtensionProvider>
            </ThemedLayout>
        </Root>
    )
}

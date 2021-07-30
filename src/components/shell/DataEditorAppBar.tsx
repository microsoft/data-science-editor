import React, { useContext } from "react"
import { Hidden, Box, makeStyles, createStyles } from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
// tslint:disable-next-line: no-submodule-imports
import DarkModeContext from "../ui/DarkModeContext"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import { Link } from "gatsby-theme-material-ui"
import ForumIcon from "@material-ui/icons/Forum"
import { HideOnScroll } from "../ui/HideOnScroll"

const useStyles = makeStyles(theme =>
    createStyles({
        grow: {
            flexGrow: 1,
        },
        appBar: {
            transition: theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        menuButton: {
            marginRight: theme.spacing(1),
        },
    })
)

export default function DataEditorAppBar() {
    const classes = useStyles()
    const { darkMode } = useContext(DarkModeContext)
    const appBarColor = darkMode === "dark" ? "inherit" : undefined

    return (
        <Box displayPrint="none">
            <HideOnScroll>
                <AppBar
                    position="fixed"
                    color={appBarColor}
                    className={classes.appBar}
                >
                    <Toolbar>
                        <Hidden implementation="css" xsDown={true}>
                            <Typography component="h1" variant="h6">
                                <Link
                                    style={{
                                        color: "white",
                                    }}
                                    to="/editors/data/"
                                >
                                    Data Science Editor (Experimental)
                                </Link>
                            </Typography>
                        </Hidden>
                        <div className={classes.grow} />
                        <IconButtonWithTooltip
                            className={classes.menuButton}
                            aria-label="Discussions"
                            title="Discussions"
                            edge="start"
                            color="inherit"
                            to="https://github.com/microsoft/jacdac/discussions/categories/data-editor"
                        >
                            <ForumIcon />
                        </IconButtonWithTooltip>
                    </Toolbar>
                </AppBar>
            </HideOnScroll>
        </Box>
    )
}

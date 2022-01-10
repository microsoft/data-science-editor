import React, { useContext } from "react"
import { styled } from "@mui/material/styles"
import { Hidden, Box } from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
// tslint:disable-next-line: no-submodule-imports
import DarkModeContext from "../ui/DarkModeContext"
import { HideOnScroll } from "../ui/HideOnScroll"
import { Link } from "gatsby-theme-material-ui"

const PREFIX = "DataEditorApp"

const classes = {
    grow: `${PREFIX}-grow`,
    appBar: `${PREFIX}-appBar`,
    menuButton: `${PREFIX}-menuButton`,
}

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.grow}`]: {
        flexGrow: 1,
    },

    [`& .${classes.appBar}`]: {
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },

    [`& .${classes.menuButton}`]: {
        marginRight: theme.spacing(1),
    },
}))

export default function DataEditorAppBar() {
    const { darkMode } = useContext(DarkModeContext)
    const appBarColor = darkMode === "dark" ? "inherit" : undefined

    return (
        <StyledBox displayPrint="none">
            <HideOnScroll>
                <AppBar
                    position="fixed"
                    color={appBarColor}
                    className={classes.appBar}
                >
                    <Toolbar>
                        <Hidden implementation="css" smDown={true}>
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
                        <Link
                            className={classes.menuButton}
                            aria-label="Learn about the data editor"
                            title="Learn about the data editor"
                            color="inherit"
                            to="/editors/data/about"
                        >
                            About
                        </Link>
                    </Toolbar>
                </AppBar>
            </HideOnScroll>
        </StyledBox>
    )
}

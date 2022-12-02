import { Grid } from "@mui/material"
import React, { useContext, MouseEvent } from "react"
import useChange from "../../jacdac/useChange"
import BrainManagerContext from "./BrainManagerContext"
import GridHeader from "../ui/GridHeader"
import CmdButton from "../CmdButton"
import RefreshIcon from "@mui/icons-material/Refresh"
import { Button } from "gatsby-theme-material-ui"
import AddIcon from "@mui/icons-material/Add"
import BrainScriptCard from "./BrainScriptCard"

export default function BrainScriptGridItems() {
    const { brainManager, showNewScriptDialog } =
        useContext(BrainManagerContext)
    const scripts = useChange(brainManager, _ => _?.scripts())

    const handleRefresh = () => brainManager?.refreshScripts()
    const handleNewScript = (ev: MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation()
        ev.preventDefault()
        showNewScriptDialog()
    }

    return (
        <>
            <GridHeader
                title="Scripts"
                action={
                    <>
                        <Button
                            title="new script"
                            onClick={handleNewScript}
                            startIcon={<AddIcon />}
                            disabled={!brainManager}
                        />
                        <CmdButton
                            title="refresh"
                            onClick={handleRefresh}
                            icon={<RefreshIcon />}
                            disabled={!brainManager}
                        />
                    </>
                }
            />
            {scripts?.map(script => (
                <Grid item key={script.id}>
                    <BrainScriptCard script={script} />
                </Grid>
            ))}
        </>
    )
}

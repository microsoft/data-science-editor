import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
} from "@mui/material"
import React, { useMemo, useState } from "react"
import { useId } from "react-use-id-hook"
import { serviceSpecifications } from "../../../jacdac-ts/src/jdom/spec"
import SelectWithLabel from "../ui/SelectWithLabel"
import useMediaQueries from "../hooks/useMediaQueries"

export default function SelectServiceDialog(props: {
    open: boolean
    onClose: (serviceShortId: string) => void
}) {
    const { open, onClose } = props
    const deviceHostDialogId = useId()
    const deviceHostLabelId = useId()

    const [selected, setSelected] = useState("button")
    const specDefinitions = useMemo(() => serviceSpecifications(), [])
    const { mobile } = useMediaQueries()

    const handleChange = (ev: React.ChangeEvent<{ value: unknown }>) => {
        setSelected(ev.target.value as string)
    }
    const handleCancel = () => {
        onClose(undefined)
    }
    const handleStart = () => {
        // const provider = providerDefinitions.find(h => h.name === selected)
        // addServiceProvider(bus, provider)
        onClose(selected)
    }

    return (
        <Dialog
            id={deviceHostDialogId}
            aria-labelledby={deviceHostLabelId}
            open={open}
            onClose={() => onClose(undefined)}
            fullScreen={mobile}
        >
            <DialogTitle id={deviceHostLabelId}>Start a simulator</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <SelectWithLabel
                            fullWidth={true}
                            helperText={"Select a service"}
                            label={"Service"}
                            value={selected}
                            onChange={handleChange}
                        >
                            {specDefinitions.map(host => (
                                <MenuItem key={host.name} value={host.name}>
                                    {host.name}
                                </MenuItem>
                            ))}
                        </SelectWithLabel>
                    </Grid>
                    <Grid item>
                        <Grid container spacing={1}>
                            {mobile && (
                                <Grid item>
                                    <Button
                                        aria-label={`cancel`}
                                        variant="contained"
                                        title="Cancel"
                                        onClick={handleCancel}
                                    >
                                        cancel
                                    </Button>
                                </Grid>
                            )}
                            <Grid item>
                                <Button
                                    aria-label={`Select ${selected}`}
                                    color="primary"
                                    variant="contained"
                                    title="Select"
                                    onClick={handleStart}
                                >
                                    start
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    )
}

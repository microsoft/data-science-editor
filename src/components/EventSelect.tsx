import React, { useContext } from "react"
// tslint:disable-next-line: no-submodule-imports
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
// tslint:disable-next-line: no-submodule-imports
import InputLabel from "@material-ui/core/InputLabel"
// tslint:disable-next-line: no-submodule-imports
import MenuItem from "@material-ui/core/MenuItem"
// tslint:disable-next-line: no-submodule-imports
import FormControl from "@material-ui/core/FormControl"
// tslint:disable-next-line: no-submodule-imports
import Select from "@material-ui/core/Select"
import { JDEvent } from "../../jacdac-ts/src/jdom/event"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import clsx from "clsx"
import useEvents from "./hooks/useEvents"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            minWidth: 120,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    })
)

export default function EventSelect(props: {
    eventId: string
    onChange: (eventId: string) => void
    label: string
    className?: string
}) {
    const { eventId, onChange, label, className } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const classes = useStyles()
    const events = useEvents()
    const selectedEvent = bus.node(eventId) as JDEvent

    const handleChange = (ev: React.ChangeEvent<{ value: unknown }>) => {
        onChange(ev.target.value as string)
    }

    return (
        <FormControl
            variant="outlined"
            className={clsx(className, classes.formControl)}
        >
            <InputLabel key="label">{label}</InputLabel>
            <Select
                key="select"
                value={selectedEvent ? eventId : ""}
                onChange={handleChange}
                label={selectedEvent?.qualifiedName}
            >
                <MenuItem key={"none"} value={""}>
                    <em>None</em>
                </MenuItem>
                {events.map(ev => (
                    <MenuItem key={ev.id} value={ev.id}>
                        {ev.friendlyName}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

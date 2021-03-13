import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    createStyles,
    Grid,
    makeStyles,
    Switch,
    Theme,
} from "@material-ui/core"
import React from "react"
import { JDRegister } from "../../jacdac-ts/src/jdom/register"
import DeviceActions from "./DeviceActions"
import useGridBreakpoints from "./useGridBreakpoints"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord"
import FieldDataSet from "./FieldDataSet"
import useDeviceName from "./devices/useDeviceName"

const useStyles = makeStyles(() =>
    createStyles({
        vmiddle: {
            verticalAlign: "middle",
        },
    })
)

function ReadingFieldGridItem(props: {
    register: JDRegister
    handleRegisterCheck: (register: JDRegister) => void
    recording: boolean
    registerChecked: boolean
    liveDataSet?: FieldDataSet
}) {
    const {
        register,
        handleRegisterCheck,
        recording,
        registerChecked,
        liveDataSet,
    } = props
    const gridBreakpoints = useGridBreakpoints()
    const classes = useStyles()
    const deviceName = useDeviceName(register.service.device)
    const handleCheck = () => handleRegisterCheck(register)

    return (
        <Grid item {...gridBreakpoints} key={"source" + register.id}>
            <Card>
                <CardHeader
                    subheader={register.service.name}
                    title={`${deviceName}/${register.name}`}
                    action={
                        <DeviceActions
                            device={register.service.device}
                            showReset={true}
                        />
                    }
                />
                <CardContent>
                    {register.fields.map(field => (
                        <span key={field.id}>
                            <FiberManualRecordIcon
                                className={classes.vmiddle}
                                fontSize="large"
                                style={{
                                    color:
                                        (registerChecked &&
                                            liveDataSet?.colorOf(field)) ||
                                        "#ccc",
                                }}
                            />
                            {field.name}
                        </span>
                    ))}
                </CardContent>
                <CardActions>
                    <Switch
                        disabled={recording}
                        onChange={handleCheck}
                        checked={registerChecked}
                    />
                </CardActions>
            </Card>
        </Grid>
    )
}

export default function ReadingFieldGrid(props: {
    readingRegisters: JDRegister[]
    registerIdsChecked: string[]
    recording?: boolean
    handleRegisterCheck: (register: JDRegister) => void
    liveDataSet?: FieldDataSet
}) {
    const {
        readingRegisters,
        registerIdsChecked,
        recording,
        handleRegisterCheck,
        liveDataSet,
    } = props

    return (
        <Grid container spacing={2}>
            {readingRegisters.map(register => {
                const registerChecked =
                    registerIdsChecked.indexOf(register.id) > -1
                return (
                    <ReadingFieldGridItem
                        key={register.id}
                        register={register}
                        registerChecked={registerChecked}
                        recording={recording}
                        handleRegisterCheck={handleRegisterCheck}
                        liveDataSet={liveDataSet}
                    />
                )
            })}
        </Grid>
    )
}

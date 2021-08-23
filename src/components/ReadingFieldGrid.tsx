import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    createStyles,
    Grid,
    makeStyles,
} from "@material-ui/core"
import React from "react"
import JDRegister from "../../jacdac-ts/src/jdom/register"
import useGridBreakpoints from "./useGridBreakpoints"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord"
import FieldDataSet from "./FieldDataSet"
import useDeviceName from "./devices/useDeviceName"
import SwitchWithLabel from "./ui/SwitchWithLabel"

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
    const { service } = register
    const { device } = service
    const gridBreakpoints = useGridBreakpoints()
    const classes = useStyles()
    const deviceName = useDeviceName(device)
    const handleCheck = () => handleRegisterCheck(register)

    return (
        <Grid item {...gridBreakpoints} key={"source" + register.id}>
            <Card>
                <CardHeader
                    subheader={register.service.name}
                    title={`${deviceName}/${register.name}`}
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
                    <SwitchWithLabel
                        disabled={recording}
                        onChange={handleCheck}
                        checked={registerChecked}
                        label={`record ${deviceName}/${register.name}`}
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

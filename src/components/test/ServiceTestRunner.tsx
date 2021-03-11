import React, { useCallback } from "react"
import useServiceClient from "../useServiceClient"
import {
    Grid,
    Button,
    List,
    ListItemText,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    Typography,
    Card,
    CardContent,
    LinearProgressProps,
    LinearProgress,
    CardActions,
    Box,
} from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import Alert from "../ui/Alert"
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import {
    JDServiceTestRunner,
    JDTestRunner,
    JDTestStatus,
    JDCommandRunner,
    JDCommandStatus,
} from "../../../jacdac-ts/src/test/testrunner"
import ErrorIcon from "@material-ui/icons/Error"
import CheckCircleIcon from "@material-ui/icons/CheckCircle"
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty"
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled"
import useChange from "../../jacdac/useChange"
import DashboardDevice from "../dashboard/DashboardDevice"
import LoadingProgress from "../ui/LoadingProgress"
import { serviceTestFromServiceClass } from "../../../jacdac-ts/src/jdom/test"

function TestStatusIcon(props: { test: JDTestRunner }) {
    const { test } = props
    const status = useChange(test, t => t.status)

    switch (status) {
        case JDTestStatus.ReadyToRun:
            return <PauseCircleOutlineIcon color="action" />
        case JDTestStatus.Active:
            return <PlayCircleFilledIcon color="action" />
        case JDTestStatus.Failed:
            return <ErrorIcon color="error" />
        case JDTestStatus.Passed:
            return <CheckCircleIcon color="primary" />
        default:
            return <HourglassEmptyIcon color="disabled" />
    }
}

function TestListItem(props: {
    test: JDTestRunner
    currentTest: JDTestRunner,
    onSelectTest: (test: JDTestRunner) => void
}) {
    const { test, currentTest, onSelectTest } = props
    const description = useChange(test, t => t.description)
    const selected = test === currentTest
    const handleSelectTest = () => onSelectTest(test)

    return (
        <ListItem selected={selected} button onClick={handleSelectTest}>
            <ListItemIcon>
                <TestStatusIcon test={test} />
            </ListItemIcon>
            <ListItemText primary={description} />
        </ListItem>
    )
}

function TestList(props: {
    testRunner: JDServiceTestRunner
    currentTest: JDTestRunner,
    onSelectTest: (test: JDTestRunner) => void
}) {
    const { testRunner, currentTest, onSelectTest } = props
    const { tests } = testRunner

    return (
        <Card>
            <CardContent>
                <List dense={true}>
                    {tests?.map((test, i) => (
                        <TestListItem
                            key={i}
                            test={test}
                            currentTest={currentTest}
                            onSelectTest={onSelectTest}
                        />
                    ))}
                </List>
            </CardContent>
        </Card>
    )
}

function CommandStatusIcon(props: { command: JDCommandRunner }) {
    const { command } = props
    const status = useChange(command, c => c.status)

    switch (status) {
        case JDCommandStatus.Active:
        case JDCommandStatus.RequiresUserInput:
            return <PlayCircleFilledIcon color="action" />
        case JDCommandStatus.Failed:
            return <ErrorIcon color="error" />
        case JDCommandStatus.Passed:
            return <CheckCircleIcon color="primary" />
        default:
            return <HourglassEmptyIcon color="disabled" />
    }
}

function CommandListItem(props: { command: JDCommandRunner }) {
    const { command } = props
    const { message, progress } = useChange(command, c => c.output)
    const status = useChange(command, c => c.status)
    const handleAnswer = (status: JDCommandStatus) => () =>
        command.finish(status)
    return (
        <ListItem selected={status === JDCommandStatus.Active}>
            <ListItemIcon>
                <CommandStatusIcon command={command} />
            </ListItemIcon>
            <ListItemText
                primary={message}
                secondary={!progress ? "" : progress.toString()}
            />
            {status === JDCommandStatus.RequiresUserInput && (
                <ListItemSecondaryAction>
                    <Button
                        variant="outlined"
                        onClick={handleAnswer(JDCommandStatus.Passed)}
                    >
                        Yes
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleAnswer(JDCommandStatus.Failed)}
                    >
                        No
                    </Button>
                </ListItemSecondaryAction>
            )}
        </ListItem>
    )
}

function FirstCommand(props: { command: JDCommandRunner }) {
    const { command } = props
    const { message } = useChange(command, c => c.output)
    return <Box m={2}>
        <Typography variant="body1">{message}</Typography>
    </Box>
}

function ActiveTest(props: { test: JDTestRunner }) {
    const { test } = props
    const { commands } = test
    const status = useChange(test, t => t.status)
    const handleRun = () => test.start()
    const handleReset = () => {
        test.reset()
        test.ready()
    }
    const handleNext = () => test.next()
    const showCommands =
        [JDTestStatus.Active, JDTestStatus.Failed, JDTestStatus.Passed].indexOf(
            status
        ) > -1

    const [firstCommand, ...restOfCommands] = commands

    /**
    const description = useChange(test, t => t.description)     
    <CardHeader
                title={<Typography variant="h5">{description}</Typography>}
                avatar={<TestStatusIcon test={test} />}
            />
     */

    return (
        <Card>
            <CardContent>
                {showCommands &&
                    <>
                        <Typography variant="h5">WHEN</Typography>
                        <FirstCommand command={firstCommand} />
                        <Typography variant="h5">TEST</Typography>
                        <List dense={false}>
                            {restOfCommands.map((cmd, i) => (
                                <CommandListItem key={i} command={cmd} />
                            ))}
                        </List>
                    </>
                }
                {status === JDTestStatus.Passed && <Alert severity="success">Test passed</Alert>}
                {status === JDTestStatus.Failed && <Alert severity="error">Test failed</Alert>}
            </CardContent>
            <CardActions>
                <Grid container spacing={1}>
                    {status === JDTestStatus.ReadyToRun && (
                        <Grid item>
                            <Button variant="outlined" onClick={handleRun}>
                                Run
                            </Button>
                        </Grid>
                    )}
                    {(status === JDTestStatus.Active || status === JDTestStatus.Failed || status === JDTestStatus.Passed) && (
                        <Grid item>
                            <Button variant="outlined" onClick={handleReset}>
                                Restart
                            </Button>
                        </Grid>
                    )}
                    {(status === JDTestStatus.Failed || status === JDTestStatus.Passed) && (
                        <Grid item>
                            <Button variant="outlined" onClick={handleNext}>
                                Next
                                </Button>
                        </Grid>
                    )}
                </Grid>
            </CardActions>
        </Card>
    )
}

function LinearProgressWithLabel(
    props: LinearProgressProps & { label: string; value: number; total: number }
) {
    const { label, value, total, ...others } = props
    return (
        <Grid container spacing={2} alignItems="center">
            <Grid item>
                <Typography
                    variant="h5"
                    color="primary"
                >{`${label} ${value} / ${total}`}</Typography>
            </Grid>
            <Grid item xs>
                <LinearProgress
                    variant="determinate"
                    value={(value / total) * 100}
                    {...others}
                />
            </Grid>
        </Grid>
    )
}

function TestProgress(props: { testRunner: JDServiceTestRunner }) {
    const { testRunner } = props
    const { tests } = testRunner
    const total = tests.length
    const executed = useChange(testRunner, t =>
        t.tests.reduce((v, t) => v + (t.indeterminate ? 0 : 1), 1)
    )
    const label = testRunner.service.friendlyName
    return (
        <Card>
            <CardContent>
                <LinearProgressWithLabel
                    label={`${label} tests`}
                    value={executed}
                    total={total}
                />
            </CardContent>
        </Card>
    )
}

export default function ServiceTestRunner(props: {
    service: JDService
    serviceTest?: jdtest.ServiceTestSpec
}) {
    const {
        service,
        serviceTest = serviceTestFromServiceClass(service.serviceClass),
    } = props
    const factory = useCallback(
        service => serviceTest && new JDServiceTestRunner(serviceTest, service),
        [service, serviceTest]
    )
    const testRunner = useServiceClient(service, factory)
    const currentTest = useChange(testRunner, t => t?.currentTest)
    const handleSelectTest = (test: JDTestRunner) => {
        console.log({ test })
        testRunner.currentTest = test
    }

    if (!serviceTest)
        return (
            <Alert severity="warning">
                Sorry, there are no tests available for service{" "}
                {service.friendlyName}.
            </Alert>
        )

    if (!testRunner) return <LoadingProgress />

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TestProgress testRunner={testRunner} />
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={2} direction="row">
                    <Grid item xs={12} sm={3}>
                        <TestList
                            testRunner={testRunner}
                            currentTest={currentTest}
                            onSelectTest={handleSelectTest}
                        />
                    </Grid>
                    {currentTest && (
                        <Grid item xs={12} sm={6}>
                            <ActiveTest test={currentTest} />
                        </Grid>
                    )}
                    {service && (
                        <Grid item xs={12} sm={3}>
                            <DashboardDevice
                                showAvatar={true}
                                showHeader={true}
                                device={service.device}
                            />
                        </Grid>
                    )}
                </Grid>
            </Grid>
        </Grid>
    )
}

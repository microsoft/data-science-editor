import React, { useCallback, useEffect } from "react"
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
    CardActions,
    Box,
    ListSubheader,
} from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import Alert from "../ui/Alert"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import {
    JDServiceTestRunner,
    JDTestRunner,
    JDTestStatus,
    JDTestCommandRunner,
    JDTestCommandStatus,
} from "../../../jacdac-ts/src/test/testrunner"
import ErrorIcon from "@material-ui/icons/Error"
import CheckCircleIcon from "@material-ui/icons/CheckCircle"
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty"
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled"
import useChange from "../../jacdac/useChange"
import DashboardDevice from "../dashboard/DashboardDevice"
import LoadingProgress from "../ui/LoadingProgress"
import { serviceTestFromServiceClass } from "../../../jacdac-ts/src/test/testspec"

function TestStatusIcon(props: { test: JDTestRunner }) {
    const { test } = props
    const status = useChange(test, t => t.status)

    switch (status) {
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
    currentTest: JDTestRunner
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
    currentTest: JDTestRunner
    onSelectTest: (test: JDTestRunner) => void
}) {
    const { testRunner, currentTest, onSelectTest } = props
    const { tests } = testRunner
    const stats = useChange(testRunner, r => r.stats())

    return (
        <Card>
            <CardContent>
                <List
                    dense={true}
                    subheader={
                        <ListSubheader>
                            {`${stats.total} tests, ${stats.success} success, ${stats.failed} failed`}
                        </ListSubheader>
                    }
                >
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

function CommandStatusIcon(props: { command: JDTestCommandRunner }) {
    const { command } = props
    const status = useChange(command, c => c.status)

    switch (status) {
        case JDTestCommandStatus.Active:
        case JDTestCommandStatus.RequiresUserInput:
            return <PlayCircleFilledIcon color="action" />
        case JDTestCommandStatus.Failed:
            return <ErrorIcon color="error" />
        case JDTestCommandStatus.Passed:
            return <CheckCircleIcon color="primary" />
        default:
            return <HourglassEmptyIcon color="disabled" />
    }
}

function CommandListItem(props: { command: JDTestCommandRunner }) {
    const { command } = props
    const { message, progress } = useChange(command, c => c.output)
    const status = useChange(command, c => c.status)
    const handleAnswer = (status: JDTestCommandStatus) => () =>
        command.finish(status)
    return (
        <ListItem selected={status === JDTestCommandStatus.Active}>
            <ListItemIcon>
                <CommandStatusIcon command={command} />
            </ListItemIcon>
            <ListItemText
                primary={message}
                secondary={progress}
            />
            {status === JDTestCommandStatus.RequiresUserInput && (
                <ListItemSecondaryAction>
                    <Button
                        variant="outlined"
                        onClick={handleAnswer(JDTestCommandStatus.Passed)}
                    >
                        Yes
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleAnswer(JDTestCommandStatus.Failed)}
                    >
                        No
                    </Button>
                </ListItemSecondaryAction>
            )}
        </ListItem>
    )
}

function ActiveTest(props: { test: JDTestRunner }) {
    const { test } = props
    const { commands } = test
    const status = useChange(test, t => t.status)
    const handleRestart = () => test.start()
    const handleNext = () => test.next()
    // auto start
    useEffect(() => test.start(), [test])

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">DO</Typography>
                <Box m={2}>
                    <Typography variant="body1">{test.prompt}</Typography>
                </Box>
                <Typography variant="h5">TEST</Typography>
                <List dense={false}>
                    {commands.map((cmd, i) => (
                        <CommandListItem key={i} command={cmd} />
                    ))}
                </List>
                {status === JDTestStatus.Passed && (
                    <Alert severity="success">Test passed</Alert>
                )}
                {status === JDTestStatus.Failed && (
                    <Alert severity="error">Test failed</Alert>
                )}
            </CardContent>
            <CardActions>
                <Button
                    variant={
                        status === JDTestStatus.Active
                            ? "outlined"
                            : "contained"
                    }
                    color={
                        status === JDTestStatus.Passed ? "primary" : undefined
                    }
                    onClick={handleNext}
                >
                    Next
                </Button>
                <Button variant="outlined" onClick={handleRestart}>
                    Restart
                </Button>
            </CardActions>
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
        testRunner.currentTest = test
    }

    if (!serviceTest)
        return (
            <Alert severity="warning">
                Sorry, there are no tests available for service{" "}
                {service.specification.name}.
            </Alert>
        )

    if (!testRunner) return <LoadingProgress />

    return (
        <Grid container spacing={2}>
            <Grid item xs={3}>
                <TestList
                    testRunner={testRunner}
                    currentTest={currentTest}
                    onSelectTest={handleSelectTest}
                />
            </Grid>
            <Grid item xs={6}>
                {currentTest ? <ActiveTest test={currentTest} /> : <Alert severity={"info"}>
                    Select a test to get started.
                </Alert>}
            </Grid>
            {service && (
                <Grid item xs={3}>
                    <DashboardDevice
                        showAvatar={true}
                        showHeader={true}
                        device={service.device}
                    />
                </Grid>
            )}
        </Grid>
    )
}

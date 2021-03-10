import React, { useContext, useState, useCallback } from "react"
import useServiceClient from "./useServiceClient"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
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
    Box,
    LinearProgress,
    CardActions,
} from "@material-ui/core"
// tslint:disable-next-line: no-submodule-imports
import { AlertTitle } from "@material-ui/lab"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import InfoIcon from "@material-ui/icons/Info"
import Alert from "./ui/Alert"
import IconButtonWithTooltip from "./ui/IconButtonWithTooltip"
import {
    addHost,
    hostDefinitionFromServiceClass,
} from "../../jacdac-ts/src/hosts/hosts"
import Flags from "../../jacdac-ts/src/jdom/flags"
import { JDService } from "../../jacdac-ts/src/jdom/service"
import { serviceTestFromServiceSpec } from "../../jacdac-ts/src/jdom/test"
import {
    JDServiceTestRunner, 
    JDTestRunner, 
    JDTestStatus,
    JDCommandRunner,
    JDCommandStatus,
} from "../../jacdac-ts/src/test/testrunner"
import SelectService from "./SelectService"
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import useChange from "../jacdac/useChange"
import DashboardDevice from "./dashboard/DashboardDevice"

function Diagnostics(props: { serviceClass: number }) {
    const { serviceClass } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)

    const hostDefinition = hostDefinitionFromServiceClass(serviceClass)
    const handleStartSimulator = () => addHost(bus, hostDefinition.services())

    if (!hostDefinition)
        return null;

    return (
        <Alert severity="info">
            <AlertTitle>Developer zone</AlertTitle>
            <Button variant="outlined" onClick={handleStartSimulator}>
                start simulator
            </Button>
        </Alert>
    )
}

function TestStatusIcon(props: { test: JDTestRunner }) {
    const { test } = props;
    const status = useChange(test, t => t.status);

    switch (status) {
        case JDTestStatus.ReadyToRun: return <PlayCircleFilledIcon color="action" />
        case JDTestStatus.Active: return <PlayCircleFilledIcon color="action" />
        case JDTestStatus.Failed: return <ErrorIcon color="error" />
        case JDTestStatus.Passed: return <CheckCircleIcon color="primary" />
        default: return <HourglassEmptyIcon color="disabled" />
    }
}

function TestListItem(props: { test: JDTestRunner }) {
    const { test } = props;
    const description = useChange(test, t => t.description);

    return <ListItem>
        <ListItemIcon>
            <TestStatusIcon test={test} />
        </ListItemIcon>
        <ListItemText primary={description} />
    </ListItem>
}

function TestList(props: { testRunner: JDServiceTestRunner }) {
    const { testRunner } = props;
    const { tests } = testRunner;

    return <Card>
        <CardContent>
            <List dense={true}>
                {tests.map((test, i) => <TestListItem key={i} test={test} />)}
            </List>
        </CardContent>
    </Card>
}

function CommandStatusIcon(props: { command: JDCommandRunner }) {
    const { command } = props;
    const status = useChange(command, c => c.status);

    switch (status) {
        case JDCommandStatus.Active: 
        case JDCommandStatus.RequiresUserInput: 
            return <PlayCircleFilledIcon color="action" />
        case JDCommandStatus.Failed: return <ErrorIcon color="error" />
        case JDCommandStatus.Passed: return <CheckCircleIcon color="primary" />
        default: return <HourglassEmptyIcon color="disabled" />
    }
}

function CommandListItem(props: { command: JDCommandRunner }) {
    const { command } = props;
    const { message, progress } = useChange(command, c => c.output);
    const status = useChange(command, c => c.status);
    const handleAnswer = (status: JDCommandStatus) => () => command.finish(status)
    return <ListItem>
        <ListItemIcon>
            <CommandStatusIcon command={command} />
        </ListItemIcon>
        <ListItemText primary={message} secondary={!progress ? "" : progress.toString()} />
        {status === JDCommandStatus.RequiresUserInput &&
            <ListItemSecondaryAction>
                <Button variant="outlined" onClick={handleAnswer(JDCommandStatus.Passed)}>Yes</Button>
                <Button variant="outlined" onClick={handleAnswer(JDCommandStatus.Failed)}>No</Button>
            </ListItemSecondaryAction>
        }
    </ListItem>
}

// TODO: end of test
function CommandList(props: { test: JDTestRunner }) {
    const { test } = props;
    const { commands } = test;
    const status = useChange(test, t => t.status);
    const handleRun = () => test.start();
    const handleReset = () => { test.reset(); test.ready(); }
    const handleCancel = () => { test.cancel() }
    return <Card>
        <CardContent>
            {status === JDTestStatus.ReadyToRun &&
                <Button variant="outlined" onClick={handleRun}>Run</Button>
            }
            {status === JDTestStatus.Active &&
                <Button variant="outlined" onClick={handleReset}>Reset</Button>
            }
            {status === JDTestStatus.Active &&
                <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
            }
            {status === JDTestStatus.Active &&
                <List dense={false}>
                    {commands.map((cmd, i) => <CommandListItem key={i} command={cmd} />)}
                </List>
            }
        </CardContent>
    </Card>
}

function ActiveTest(props: { test: JDTestRunner }) {
    const { test } = props;
    const description = useChange(test, t => t.description);

    return <Card>
        <CardContent>
            <Typography variant="h5" component="h2">{description}</Typography>
            <CommandList
                test={test}
            />
        </CardContent>
    </Card>
}

function ServiceTestRunnerSelect(props: { serviceClass: number, onSelect: (service: JDService) => void }) {
    const { serviceClass, onSelect } = props;
    return <>
        <h3>Select a device to test</h3>
        <SelectService
            serviceClass={serviceClass}
            onSelect={onSelect}
        />
    </>
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number, total: number }) {
    const { value, total, ...others } = props;
    return (
        <Box display="flex" alignItems="center">
            <Box>
                <Typography variant="h5" color="primary">{`test ${value} / ${total}`}</Typography>
            </Box>
            <Box width="100%" mr={1}>
                <LinearProgress variant="determinate" value={value / total * 100} {...others} />
            </Box>
        </Box>
    );
}

function TestProgress(props: { testRunner: JDServiceTestRunner }) {
    const { testRunner } = props;
    const { tests } = testRunner;
    const total = tests.length;
    const executed = useChange(testRunner, t => t.tests.reduce((v, t) => v + (t.indeterminate ? 1 : 0), 0))
    return <Card>
        <CardContent>
            <LinearProgressWithLabel value={executed} total={total} />
        </CardContent>
    </Card>
}

export default function ServiceTest(props: {
    serviceSpec: jdspec.ServiceSpec,
    serviceTest?: jdtest.ServiceTestSpec,
    showStartSimulator?: boolean
}) {
    const { serviceSpec, showStartSimulator, serviceTest = serviceTestFromServiceSpec(serviceSpec) } = props
    const { classIdentifier: serviceClass } = serviceSpec
    const [selectedService, setSelectedService] = useState<JDService>(undefined)
    const factory = useCallback(service => new JDServiceTestRunner(serviceTest, service), [serviceTest])
    const testRunner = useServiceClient(selectedService, factory)
    const currentTest = useChange(testRunner, t => t?.currentTest)
    const handleSelect = (service: JDService) => setSelectedService(service)
    return (
        <>
            <h1>
                {`${serviceSpec.name} tests`}
                <IconButtonWithTooltip title="go to specifiction" to={`/services/${serviceSpec.shortId}/`}>
                    <InfoIcon />
                </IconButtonWithTooltip>
            </h1>
            {(Flags.diagnostics || showStartSimulator) && <Diagnostics serviceClass={serviceClass} />}
            {!testRunner && <ServiceTestRunnerSelect serviceClass={serviceClass} onSelect={handleSelect} />}
            {testRunner && <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TestProgress testRunner={testRunner} />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2} direction="row">
                        <Grid item xs={12} sm={3}>
                            <TestList testRunner={testRunner} />
                        </Grid>
                        {currentTest && <Grid item xs={12} sm={6}>
                            <ActiveTest test={currentTest} />
                        </Grid>}
                        {selectedService && <Grid item xs={12} sm={3}>
                            <DashboardDevice
                                showAvatar={true}
                                showHeader={true}
                                device={selectedService.device} />
                        </Grid>}
                    </Grid>
                </Grid>
            </Grid>}
        </>
    )
}

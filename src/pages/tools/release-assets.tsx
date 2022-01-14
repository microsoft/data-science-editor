/* eslint-disable react/jsx-key */
// tslint:disable-file: match-default-export-name no-submodule-imports
import React from "react"
import { Grid } from "@mui/material"
import { uniqueMap } from "../../../jacdac-ts/src/jdom/utils"
import { serviceProviderDefinitions } from "../../../jacdac-ts/src/servers/servers"
import { hasServiceView } from "../../components/dashboard/DashboardServiceWidget"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import { withPrefix } from "gatsby-link"

// run scripts/collecticons.js to refresh

import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import GetAppIcon from "@mui/icons-material/GetApp"
import LaunchIcon from "@mui/icons-material/Launch"
import AddIcon from "@mui/icons-material/Add"
import ClearIcon from "@mui/icons-material/Clear"
import DevicesIcon from "@mui/icons-material/Devices"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import RemoveIcon from "@mui/icons-material/Remove"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import RefreshIcon from "@mui/icons-material/Refresh"
import CloseIcon from "@mui/icons-material/Close"
import MicIcon from "@mui/icons-material/Mic"
import VoiceChatIcon from "@mui/icons-material/VoiceChat"
import HistoryIcon from "@mui/icons-material/History"
import MenuIcon from "@mui/icons-material/Menu"
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import GitHubIcon from "@mui/icons-material/GitHub"
import UsbIcon from "@mui/icons-material/Usb"
import BluetoothIcon from "@mui/icons-material/Bluetooth"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import CreateIcon from "@mui/icons-material/Create"
import LockIcon from "@mui/icons-material/Lock"
import CallToActionIcon from "@mui/icons-material/CallToAction"
import FlashOnIcon from "@mui/icons-material/FlashOn"
import DataUsageIcon from "@mui/icons-material/DataUsage"
import ReplyIcon from "@mui/icons-material/Reply"
import DeviceUnknownIcon from "@mui/icons-material/DeviceUnknown"
import DeviceHubIcon from "@mui/icons-material/DeviceHub"
import BubbleChartIcon from "@mui/icons-material/BubbleChart"
import ComputerIcon from "@mui/icons-material/Computer"
import BlurLinearIcon from "@mui/icons-material/BlurLinear"
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import SettingsIcon from "@mui/icons-material/Settings"
import MoreIcon from "@mui/icons-material/MoreVert"
import WarningIcon from "@mui/icons-material/Warning"
import ErrorIcon from "@mui/icons-material/Error"
import MessageIcon from "@mui/icons-material/Message"
import NoteIcon from "@mui/icons-material/Note"
import DeleteIcon from "@mui/icons-material/Delete"
import SaveIcon from "@mui/icons-material/Save"
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft"
import CodeIcon from "@mui/icons-material/Code"
import FilterListIcon from "@mui/icons-material/FilterList"
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder"
import GroupWorkIcon from "@mui/icons-material/GroupWork"
import CategoryIcon from "@mui/icons-material/Category"
import ReplayIcon from "@mui/icons-material/Replay"
import PauseIcon from "@mui/icons-material/Pause"
import LiveTvIcon from "@mui/icons-material/LiveTv"
import CheckIcon from "@mui/icons-material/Check"
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import SearchIcon from "@mui/icons-material/Search"
import SpeedIcon from "@mui/icons-material/Speed"
import InfoIcon from "@mui/icons-material/Info"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness"
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt"
import WifiIcon from "@mui/icons-material/Wifi"
import EditIcon from "@mui/icons-material/Edit"
import JacdacIcon from "../../components/icons/JacdacIcon"
import MakeCodeIcon from "../../components/icons/MakeCodeIcon"
import EdgeImpulseIcon from "../../components/icons/EdgeImpulseIcon"
import JupyterIcon from "../../components/icons/JupyterIcon"
import HumidityIcon from "../../components/icons/HumidityIcon"
import TemperatureIcon from "../../components/icons/TemperatureIcon"
import ForumIcon from "@mui/icons-material/Forum"

function CustomIconGrid() {
    const icons = [<JacdacIcon />, <HumidityIcon />, <TemperatureIcon />]
    return (
        <Grid container spacing={1}>
            {icons.map((icon, i) => (
                <Grid item key={i}>
                    {icon}
                </Grid>
            ))}
        </Grid>
    )
}

function MaterialUIIconGrid() {
    const icons = [
        <ExpandMoreIcon />,
        <CheckCircleOutlineIcon />,
        <GetAppIcon />,
        <LaunchIcon />,
        <AddIcon />,
        <ClearIcon />,
        <DevicesIcon />,
        <ExpandLessIcon />,
        <RemoveIcon />,
        <PlayArrowIcon />,
        <RefreshIcon />,
        <CloseIcon />,
        <MicIcon />,
        <VoiceChatIcon />,
        <HistoryIcon />,
        <MenuIcon />,
        <AccountTreeIcon />,
        <GitHubIcon />,
        <UsbIcon />,
        <BluetoothIcon />,
        <ArrowDropDownIcon />,
        <ArrowRightIcon />,
        <CreateIcon />,
        <LockIcon />,
        <CallToActionIcon />,
        <FlashOnIcon />,
        <DataUsageIcon />,
        <ReplyIcon />,
        <DeviceUnknownIcon />,
        <DeviceHubIcon />,
        <BubbleChartIcon />,
        <ComputerIcon />,
        <BlurLinearIcon />,
        <ConfirmationNumberIcon />,
        <NotificationsNoneIcon />,
        <CheckCircleIcon />,
        <SettingsIcon />,
        <MoreIcon />,
        <WarningIcon />,
        <ErrorIcon />,
        <MessageIcon />,
        <NoteIcon />,
        <DeleteIcon />,
        <SaveIcon />,
        <ArrowLeftIcon />,
        <CodeIcon />,
        <FilterListIcon />,
        <QueryBuilderIcon />,
        <GroupWorkIcon />,
        <CategoryIcon />,
        <ReplayIcon />,
        <PauseIcon />,
        <LiveTvIcon />,
        <CheckIcon />,
        <FiberManualRecordIcon />,
        <SearchIcon />,
        <SpeedIcon />,
        <InfoIcon />,
        <HourglassEmptyIcon />,
        <PlayCircleFilledIcon />,
        <ChevronRightIcon />,
        <SettingsBrightnessIcon />,
        <SystemUpdateAltIcon />,
        <WifiIcon />,
        <EditIcon />,
        <ForumIcon />,
    ]
    return (
        <Grid container spacing={1}>
            {icons.map((icon, i) => (
                <Grid item key={i}>
                    {icon}
                </Grid>
            ))}
        </Grid>
    )
}

export default function ReleaseAssets() {
    const services = uniqueMap(
        serviceProviderDefinitions().filter(
            hd =>
                hd.serviceClasses.length === 1 &&
                hasServiceView(hd.serviceClasses[0])
        ),
        hd => hd.serviceClasses[0].toString(),
        h => serviceSpecificationFromClassIdentifier(h.serviceClasses[0])
    )
    return (
        <>
            <h1>Release Assets</h1>
            <h2>Icons</h2>
            <h3>Custom</h3>
            <CustomIconGrid />
            <h3>Material UI</h3>
            <MaterialUIIconGrid />
            <h3>Service Simulators</h3>
            <p>These services has a custom simulator.</p>
            <ul>
                {services.map((srv, i) => (
                    <li key={i}>
                        <a
                            href={withPrefix(
                                `/services/${srv.shortId}/playground`
                            )}
                            target="review"
                        >
                            {srv.name}
                        </a>
                    </li>
                ))}
            </ul>
        </>
    )
}

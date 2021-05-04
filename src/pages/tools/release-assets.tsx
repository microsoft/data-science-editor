/* eslint-disable react/jsx-key */
// tslint:disable-file: match-default-export-name no-submodule-imports
import React from "react"
import { Grid } from "@material-ui/core"

// run scripts/collecticons.js to refresh

import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline"
import GetAppIcon from "@material-ui/icons/GetApp"
import LaunchIcon from "@material-ui/icons/Launch"
import AddIcon from "@material-ui/icons/Add"
import ClearIcon from "@material-ui/icons/Clear"
import DevicesIcon from "@material-ui/icons/Devices"
import ExpandLessIcon from "@material-ui/icons/ExpandLess"
import RemoveIcon from "@material-ui/icons/Remove"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import RefreshIcon from "@material-ui/icons/Refresh"
import CloseIcon from "@material-ui/icons/Close"
import MicIcon from "@material-ui/icons/Mic"
import VoiceChatIcon from "@material-ui/icons/VoiceChat"
import HistoryIcon from "@material-ui/icons/History"
import MenuIcon from "@material-ui/icons/Menu"
import AccountTreeIcon from "@material-ui/icons/AccountTree"
import GitHubIcon from "@material-ui/icons/GitHub"
import UsbIcon from "@material-ui/icons/Usb"
import BluetoothIcon from "@material-ui/icons/Bluetooth"
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown"
import ArrowRightIcon from "@material-ui/icons/ArrowRight"
import CreateIcon from "@material-ui/icons/Create"
import LockIcon from "@material-ui/icons/Lock"
import CallToActionIcon from "@material-ui/icons/CallToAction"
import FlashOnIcon from "@material-ui/icons/FlashOn"
import DataUsageIcon from "@material-ui/icons/DataUsage"
import ReplyIcon from "@material-ui/icons/Reply"
import DeviceUnknownIcon from "@material-ui/icons/DeviceUnknown"
import DeviceHubIcon from "@material-ui/icons/DeviceHub"
import BubbleChartIcon from "@material-ui/icons/BubbleChart"
import ComputerIcon from "@material-ui/icons/Computer"
import BlurLinearIcon from "@material-ui/icons/BlurLinear"
import ConfirmationNumberIcon from "@material-ui/icons/ConfirmationNumber"
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone"
import CheckCircleIcon from "@material-ui/icons/CheckCircle"
import SettingsIcon from "@material-ui/icons/Settings"
import MoreIcon from "@material-ui/icons/MoreVert"
import WarningIcon from "@material-ui/icons/Warning"
import ErrorIcon from "@material-ui/icons/Error"
import MessageIcon from "@material-ui/icons/Message"
import NoteIcon from "@material-ui/icons/Note"
import DeleteIcon from "@material-ui/icons/Delete"
import SaveIcon from "@material-ui/icons/Save"
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft"
import CodeIcon from "@material-ui/icons/Code"
import FilterListIcon from "@material-ui/icons/FilterList"
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder"
import GroupWorkIcon from "@material-ui/icons/GroupWork"
import CategoryIcon from "@material-ui/icons/Category"
import ReplayIcon from "@material-ui/icons/Replay"
import PauseIcon from "@material-ui/icons/Pause"
import LiveTvIcon from "@material-ui/icons/LiveTv"
import CheckIcon from "@material-ui/icons/Check"
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord"
import SearchIcon from "@material-ui/icons/Search"
import SpeedIcon from "@material-ui/icons/Speed"
import InfoIcon from "@material-ui/icons/Info"
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty"
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import SettingsBrightnessIcon from "@material-ui/icons/SettingsBrightness"
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt"
import WifiIcon from "@material-ui/icons/Wifi"
import EditIcon from "@material-ui/icons/Edit"
import { uniqueMap } from "../../../jacdac-ts/src/jdom/utils"
import serviceProviderDefinitions from "../../../jacdac-ts/src/servers/servers"
import { hasServiceView } from "../../components/dashboard/DashboardServiceWidget"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"

function IconGrid() {
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
            <IconGrid />
            <h3>Service Simulators</h3>
            <p>These services has a custom simulator.</p>
            <ul>
                {services.map((srv, i) => (
                    <li key={i}><a href={`/services/${srv.shortId}/playground`} target="review">{srv.name}</a></li>
                ))}
            </ul>
        </>
    )
}

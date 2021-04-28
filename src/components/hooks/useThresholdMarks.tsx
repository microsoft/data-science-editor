import React from "react"
import { Mark } from "@material-ui/core";
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue";
import EventBadge from "../ui/EventBadge"
import { JDService } from "../../../jacdac-ts/src/jdom/service";
import { SystemEvent, SystemReg } from "../../../jacdac-ts/src/jdom/constants";

export default function useThresholdMarks(service: JDService, color?: "primary" | "secondary"): Mark[] {
    const marks: Mark[] = [];
    const inactiveRegister = service.register(SystemReg.InactiveThreshold);
    const [inactive] = useRegisterUnpackedValue<[number]>(inactiveRegister)
    const activeRegister = service.register(SystemReg.ActiveThreshold);
    const [active] = useRegisterUnpackedValue<[number]>(activeRegister)

    if (inactive !== undefined) {
        const inactiveEvent = service.event(SystemEvent.Inactive);
        marks.push({
            value: inactive,
            label: inactiveEvent ? <EventBadge event={inactiveEvent} color={color} /> : inactiveRegister.name
        });
    }

    if (active !== undefined) {
        const activeEvent = service.event(SystemEvent.Active);
        marks.push({
            value: active,
            label: activeEvent ? <EventBadge event={activeEvent} color={color} /> : activeRegister.name
        });
    }

    return marks;
}
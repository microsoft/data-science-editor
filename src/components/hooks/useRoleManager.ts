import { useMemo } from "react"
import { RoleManager } from "../../../jacdac-ts/src/jdom/rolemanager"
import useBus from "../../jacdac/useBus"

export default function useRoleManager() {
    const bus = useBus()
    const roleManager = useMemo(() => new RoleManager(bus), [bus])
    return roleManager
}

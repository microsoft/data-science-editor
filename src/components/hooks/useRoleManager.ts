import { useMemo } from "react"
import { RoleManager } from "../../../jacdac-ts/src/jdom/rolemanager"
import useBus from "../../jacdac/useBus"

export default function useRoleManager() {
    const bus = useBus()
    const roleManager = useMemo(() => {
        return bus ? new RoleManager(bus) : undefined
    }, [bus])
    return roleManager
}

import { useContext, useMemo } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import RoleManager from "../../../jacdac-ts/src/servers/rolemanager"

export default function useRoleManager() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const roleManager = useMemo(() => new RoleManager(bus), [])
    return roleManager
}

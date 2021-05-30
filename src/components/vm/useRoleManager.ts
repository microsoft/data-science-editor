import { useContext, useMemo } from "react"
import { RoleManager } from "../../../jacdac-ts/src/vm/rolemanager"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"

export default function useRoleManager() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const roleManager = useMemo(() => new RoleManager(bus), [])
    return roleManager
}

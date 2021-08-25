import { useContext, useMemo } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import RoleManager from "../../../jacdac-ts/src/jdom/rolemanager"

export default function useRoleManager() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const roleManager = useMemo(() => bus && new RoleManager(bus), [bus])
    return roleManager
}

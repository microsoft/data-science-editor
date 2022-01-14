import { useContext, useMemo } from "react"
import useChange from "./useChange"
import { RoleManager } from "../../jacdac-ts/src/jdom/rolemanager"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import { JDService } from "../../jacdac-ts/src/jdom/service"

/**
 * A hook that allow to create a service role mapping
 * @param bindings
 * @param options
 * @returns
 */
export default function useRoles<
    TRoles extends Record<
        string,
        { serviceClass: number; preferredDeviceId?: string }
    >
>(
    bindings: TRoles,
    options?: {
        /**
         * Calls update even if not all role around bound
         */
        incomplete?: boolean
    }
) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { incomplete } = options || {}
    const roleManager = useMemo(() => {
        const r = new RoleManager(bus)
        r.updateRoles(
            Object.keys(bindings).map(role => ({
                role,
                serviceClass: bindings[role].serviceClass,
                preferredDeviceId: bindings[role].preferredDeviceId,
            }))
        )
        return r
    }, [bindings, incomplete])

    const roles = useChange(
        roleManager,
        _ => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const r: Record<keyof TRoles, JDService> = {} as any
            if (_ && (incomplete || _.isBound)) {
                for (const key in bindings) {
                    const srv = _.service(key)
                    if (srv) r[key] = srv
                }
            }
            return r
        },
        []
    )
    return { roleManager, roles }
}

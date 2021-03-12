import { useEffect, useState } from "react"
import { ROLE_CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"

export default function useServiceRole(service: JDService) {
    const [role, setRole] = useState<string>(service?.role);
    useEffect(() => service?.subscribe(ROLE_CHANGE, () => {
        console.log("role change", { service })
        setRole(service.role)
    }), [service])
    return role;
}
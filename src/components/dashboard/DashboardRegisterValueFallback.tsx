import React from "react"
import { humanify } from "../../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import useServiceServer from "../hooks/useServiceServer"
import IconButtonWithProgress from "../ui/IconButtonWithProgress"

export default function DashboardRegisterValueFallback(props: {
    register: JDRegister
}) {
    const { register } = props
    const service = register.service
    const server = useServiceServer(service)
    const color = server ? "secondary" : "primary"
    const handleRefresh = () => register?.sendGetAsync()
    const registerName = humanify(register.name)

    return (
        <IconButtonWithProgress
            color={color}
            title={`refresh ${registerName}`}
            indeterminate={true}
            onClick={handleRefresh}
        />
    )
}

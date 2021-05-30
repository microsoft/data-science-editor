import Blockly, { FieldVariable } from "blockly"
import React, { createContext, ReactNode, useEffect, useState } from "react"
import { CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import { JDEventSource } from "../../../jacdac-ts/src/jdom/eventsource"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { assert } from "../../../jacdac-ts/src/jdom/utils"
import { ROLES_CHANGE, } from "../../../jacdac-ts/src/vm/utils"
import { IT4ProgramRunner } from "../../../jacdac-ts/src/vm/vmrunner"
import ReactField from "./fields/ReactField"

export class WorkspaceServices extends JDEventSource {
    private _runner: IT4ProgramRunner

    constructor() {
        super()
    }

    get runner() {
        return this._runner
    }

    set runner(value: IT4ProgramRunner) {
        if (this._runner !== value) {
            this._runner = value
            this.emit(CHANGE)
        }
    }

    get roles(): {
        name: string
        service: JDService
        serviceShortId: string
    }[] {
        const roles = this._runner?.roles
        return roles
            ? Object.keys(roles).map(name => ({ name, ...roles[name] }))
            : []
    }
}

export interface WorkspaceContextProps {
    workspace?: Blockly.Workspace
    services: WorkspaceServices
    flyout?: boolean
    role?: string
    roleService?: JDService
}

export const WorkspaceContext = createContext<WorkspaceContextProps>({
    workspace: undefined,
    flyout: false,
    services: undefined,
    role: undefined,
    roleService: undefined,
})
WorkspaceContext.displayName = "Workspace"

export default WorkspaceContext

export interface BlocklyWorkspaceWithServices extends Blockly.Workspace {
    jacdacServices: WorkspaceServices
}

export function WorkspaceProvider(props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: ReactField<any>
    children: ReactNode
}) {
    const { field, children } = props
    const [sourceBlock, setSourceBlock] = useState<Blockly.Block>(
        field?.getSourceBlock()
    )

    const resolveRole = () => {
        const newSourceBlock = field.getSourceBlock()
        const roleField = newSourceBlock?.inputList[0]
            ?.fieldRow[0] as FieldVariable
        {
            assert(
                !roleField || roleField?.name === "role",
                `unexpected field ${roleField.name}`,
                { newSourceBlock, roleField }
            )
            const xml = document.createElement("xml")
            roleField?.toXml(xml)
        }
        const newRole = roleField?.getVariable()?.name
        console.log(`resolved role`, { newSourceBlock, newRole })
        return newRole
    }
    const resolveRoleService = () => {
        const newRoleService = role && runner?.resolveService(role)
        console.log(`resolve role service`, {
            role,
            newRoleService,
            roles: services?.roles,
        })
        return newRoleService
    }

    const [role, setRole] = useState<string>(resolveRole())
    const [roleService, setRoleService] = useState<JDService>(
        resolveRoleService()
    )
    const [flyout, setFlyout] = useState(!!sourceBlock?.isInFlyout)
    const workspace = sourceBlock?.workspace
    const services = (workspace as BlocklyWorkspaceWithServices)?.jacdacServices
    const runner = services?.runner

    console.log(`workspace context`, {
        field,
        sourceBlock,
        flyout,
        role,
        roleService,
        services,
        runner,
    })

    // resolve role
    useEffect(() => {
        console.log(`updated field`, { field })
        return field?.events.subscribe(CHANGE, () => {
            const newSourceBlock = field.getSourceBlock()
            console.log(`field change`, { newSourceBlock })
            setSourceBlock(newSourceBlock)
            setRole(resolveRole())
            setFlyout(!!newSourceBlock?.isInFlyout)
        })
    }, [field, workspace, runner])

    // resolve current role service
    useEffect(() => {
        setRoleService(resolveRoleService())
        return runner?.subscribe(ROLES_CHANGE, () => {
            setRoleService(resolveRoleService())
    })
    }, [role, runner])

    return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <WorkspaceContext.Provider
            value={{ services, role, roleService, flyout }}
        >
            {children}
        </WorkspaceContext.Provider>
    )
}

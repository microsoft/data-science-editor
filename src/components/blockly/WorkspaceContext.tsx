/* eslint-disable @typescript-eslint/ban-types */
import { Block, BlockSvg, Events, FieldVariable, WorkspaceSvg } from "blockly"
import React, {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useState,
} from "react"
import { CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import { JDEventSource } from "../../../jacdac-ts/src/jdom/eventsource"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import RoleManager from "../../../jacdac-ts/src/servers/rolemanager"
import { VMProgramRunner } from "../../../jacdac-ts/src/vm/runner"
import useChange from "../../jacdac/useChange"
import ReactField from "./fields/ReactField"
import { WorkspaceJSON } from "./jsongenerator"
import useWorkspaceEvent from "./useWorkspaceEvent"

export class WorkspaceServices extends JDEventSource {
    private _workspaceJSON: WorkspaceJSON
    private _runner: VMProgramRunner
    private _roleManager: RoleManager

    constructor() {
        super()
    }

    get workspaceJSON() {
        return this._workspaceJSON
    }

    set workspaceJSON(value: WorkspaceJSON) {
        this._workspaceJSON = value
        this.emit(CHANGE)
    }

    get runner() {
        return this._runner
    }

    set runner(value: VMProgramRunner) {
        if (this._runner !== value) {
            this._runner = value
            this.emit(CHANGE)
        }
    }

    get roleManager() {
        return this._roleManager
    }

    set roleManager(value: RoleManager) {
        if (this._roleManager !== value) {
            this._roleManager = value
            this.emit(CHANGE)
        }
    }
}

export interface BlocklyWorkspaceWithServices extends WorkspaceSvg {
    jacdacServices: WorkspaceServices
}

export interface FieldWithServices {
    notifyServicesChanged?: () => void
}

export class BlockServices extends JDEventSource {
    private _data: object[]
    private _chartProps: object

    get data() {
        return this._data
    }
    set data(value: object[]) {
        if (this._data !== value) {
            this._data = value
            this.emit(CHANGE)
        }
    }
    clearData() {
        this.data = undefined
    }

    get chartProps() {
        return this._chartProps
    }
    set chartProps(value: object) {
        if (this._chartProps !== value) {
            this._chartProps = value
            this.emit(CHANGE)
        }
    }

    readonly cache = {}

    initialized = false
}
export interface BlockWithServices extends BlockSvg {
    jacdacServices: BlockServices
}

export interface WorkspaceContextProps {
    workspace?: WorkspaceSvg
    workspaceJSON?: WorkspaceJSON
    dragging?: boolean
    sourceBlock?: Block
    sourceId?: string
    services: WorkspaceServices
    flyout?: boolean
    role?: string
    roleServiceShortId?: string
    roleService?: JDService
    runner?: VMProgramRunner
}

export const WorkspaceContext = createContext<WorkspaceContextProps>({
    workspace: undefined,
    workspaceJSON: undefined,
    dragging: false,
    sourceBlock: undefined,
    flyout: false,
    sourceId: undefined,
    services: undefined,
    role: undefined,
    roleServiceShortId: undefined,
    roleService: undefined,
    runner: undefined,
})
WorkspaceContext.displayName = "Workspace"

export default WorkspaceContext

export function WorkspaceProvider(props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: ReactField<any>
    children: ReactNode
}) {
    const { field, children } = props
    const [sourceBlock, setSourceBlock] = useState<Block>(
        field?.getSourceBlock()
    )
    const sourceId = sourceBlock?.id
    const workspace = sourceBlock?.workspace as WorkspaceSvg
    const services = (workspace as BlocklyWorkspaceWithServices)?.jacdacServices
    const roleManager = useChange(services, _ => _?.roleManager)
    const runner = useChange(services, _ => _?.runner)
    const workspaceJSON = useChange(services, _ => _?.workspaceJSON)
    const [dragging, setDragging] = useState(!!workspace?.isDragging())

    const resolveRole = () => {
        const newSourceBlock = field.getSourceBlock()
        const roleInput = newSourceBlock?.inputList[0]
        const roleField = roleInput?.fieldRow.find(
            f => f.name === "role" && f instanceof FieldVariable
        ) as FieldVariable
        if (roleField) {
            const xml = document.createElement("xml")
            roleField?.toXml(xml)
            const newRole = roleField?.getVariable()?.name
            return newRole
        }
        return undefined
    }
    const resolveRoleService = () => {
        const newRoleService = role && roleManager?.getService(role)
        return newRoleService
    }

    const [role, setRole] = useState<string>(resolveRole())
    const [roleService, setRoleService] = useState<JDService>(
        resolveRoleService()
    )
    const roleServiceShortId = useChange(
        roleManager,
        _ => _?.roles.find(r => r.role === role)?.serviceShortId
    )
    const [flyout, setFlyout] = useState(!!sourceBlock?.isInFlyout)

    // resolve role
    useEffect(() => {
        return field?.events.subscribe(CHANGE, () => {
            const newSourceBlock = field.getSourceBlock()
            setSourceBlock(newSourceBlock)
            setRole(resolveRole())
            setFlyout(!!newSourceBlock?.isInFlyout)
        })
    }, [field, workspace, runner])

    // resolve current role service
    useEffect(() => {
        setRoleService(resolveRoleService())
        return roleManager?.subscribe(CHANGE, () =>
            setRoleService(resolveRoleService())
        )
    }, [role, runner])

    const handleWorkspaceEvent = useCallback(
        (event: Events.Abstract & { type: string }) => {
            const { workspaceId, type } = event
            if (workspaceId !== workspace?.id) return
            if (type === Events.BLOCK_DRAG) {
                const drag = event as Events.BlockDrag
                setDragging(!!drag?.isStart)
            }
        },
        [workspace]
    )
    useWorkspaceEvent(workspace, handleWorkspaceEvent)

    return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <WorkspaceContext.Provider
            value={{
                sourceBlock,
                workspace,
                workspaceJSON,
                dragging,
                sourceId,
                services,
                role,
                roleServiceShortId,
                roleService,
                runner,
                flyout,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    )
}

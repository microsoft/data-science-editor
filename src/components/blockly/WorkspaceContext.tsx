/* eslint-disable @typescript-eslint/ban-types */
import { Block, BlockSvg, Events, FieldVariable, WorkspaceSvg } from "blockly"
import React, {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useState,
} from "react"
import { WorkspaceJSON } from "../../../jacdac-ts/src/dsl/workspacejson"
import { CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import { JDEventSource } from "../../../jacdac-ts/src/jdom/eventsource"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import RoleManager from "../../../jacdac-ts/src/servers/rolemanager"
import { VMProgramRunner } from "../../../jacdac-ts/src/vm/runner"
import useChange from "../../jacdac/useChange"
import { FileSystemDirectory } from "../fs/fsdom"
import ReactField from "./fields/ReactField"
import useWorkspaceEvent from "./useWorkspaceEvent"

export class WorkspaceServices extends JDEventSource {
    static readonly WORKSPACE_CHANGE = "workspaceChange"

    private _directory: FileSystemDirectory

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
        if (value !== this._workspaceJSON) {
            this._workspaceJSON = value
            this.emit(WorkspaceServices.WORKSPACE_CHANGE)
        }
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

    get workingDirectory() {
        return this._directory
    }
    set workingDirectory(value: FileSystemDirectory) {
        if (this._directory !== value) {
            this._directory = value
            // don't notify
        }
    }
}

export interface WorkspaceWithServices extends WorkspaceSvg {
    jacdacServices: WorkspaceServices
}

export interface FieldWithServices {
    notifyServicesChanged?: () => void
}

export class BlockServices extends JDEventSource {
    private _data: object[]
    private _transformedData: object[]
    private _chartProps: object

    get data() {
        return this._data
    }
    set data(value: object[]) {
        if (this._data !== value) {
            this._data = value
            this._transformedData = undefined
            this.emit(CHANGE)
        }
    }
    get transformedData() {
        return this._transformedData
    }
    set transformedData(value: object[]) {
        if (this._transformedData !== value) {
            this._transformedData = value
            // don't update immediately transformed data or it
            // generates an update loop
        }
    }

    clearData() {
        this._data = undefined
        this._transformedData = undefined
        this.emit(CHANGE)
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
    dragging?: boolean
    sourceBlock?: Block
    sourceId?: string
    services: WorkspaceServices
    flyout?: boolean
    role?: string
    roleServiceClass?: number
    roleService?: JDService
    runner?: VMProgramRunner
}

export const WorkspaceContext = createContext<WorkspaceContextProps>({
    workspace: undefined,
    dragging: false,
    sourceBlock: undefined,
    flyout: false,
    sourceId: undefined,
    services: undefined,
    role: undefined,
    roleServiceClass: undefined,
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
    const services = (workspace as WorkspaceWithServices)?.jacdacServices
    const roleManager = useChange(services, _ => _?.roleManager)
    const runner = useChange(services, _ => _?.runner)
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
    const roleServiceClass = useChange(
        roleManager,
        _ => _?.roles.find(r => r.role === role)?.serviceClass
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
                dragging,
                sourceId,
                services,
                role,
                roleServiceClass,
                roleService,
                runner,
                flyout,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    )
}

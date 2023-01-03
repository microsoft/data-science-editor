/* eslint-disable @typescript-eslint/ban-types */
import { Block, Events, FieldVariable, Workspace, WorkspaceSvg } from "blockly"
import React, {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useState,
} from "react"
import { WorkspaceJSON } from "./dsl/workspacejson"
import { FileSystemDirectory } from "../fs/fsdom"
import ReactField from "./fields/ReactField"
import useWorkspaceEvent from "./useWorkspaceEvent"
import { CHANGE, JDEventSource } from "jacdac-ts"

export class WorkspaceServices extends JDEventSource {
    static readonly WORKSPACE_CHANGE = "workspaceChange"
    private _directory: FileSystemDirectory
    private _workspaceJSON: WorkspaceJSON

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

export interface WorkspaceWithServices extends Workspace {
    jacdacServices: WorkspaceServices
}

export function resolveWorkspaceServices(workspace: Workspace) {
    const workspaceWithServices = workspace as WorkspaceWithServices
    const services = workspaceWithServices?.jacdacServices
    return services
}

export interface FieldWithServices {
    notifyServicesChanged?: () => void
}

export const DATA_WARNING_KEY = "data"
export class BlockServices extends JDEventSource {
    private _data: object[]
    private _transformedData: object[]
    private _warnings: Record<string, string>

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

    setDataWarning(value: string) {
        this.setWarning(DATA_WARNING_KEY, value)
    }

    get warnings() {
        return this._warnings
    }

    setWarning(key: string, value: string) {
        if (!value) {
            if (this._warnings) {
                delete this._warnings[key]
                if (!Object.keys(this._warnings).length)
                    this._warnings = undefined
            }
        } else {
            if (!this._warnings) this._warnings = {}
            this._warnings[key] = value
        }
    }

    clearData() {
        this._data = undefined
        this._transformedData = undefined
        this.setWarning(DATA_WARNING_KEY, undefined)
        this.emit(CHANGE)
    }

    readonly cache = {}

    initialized = false
}
export interface BlockWithServices extends Block {
    jacdacServices: BlockServices
}

export function resolveBlockServices(block: Block) {
    const blockWithServices = block as BlockWithServices
    const services = blockWithServices?.jacdacServices
    return services
}

export function setBlockWarning(block: Block, key: string, value: string) {
    const services = resolveBlockServices(block)
    services?.setWarning(key, value)
}

export function setBlockDataWarning(block: Block, value: string) {
    setBlockWarning(block, DATA_WARNING_KEY, value)
}

export function resolveBlockWarnings(block: Block) {
    const services = resolveBlockServices(block)
    if (services) {
        const { warnings } = services
        if (warnings) return Object.values(warnings).join("\n")
    }
    return null
}

export interface WorkspaceContextProps {
    workspace?: WorkspaceSvg
    dragging?: boolean
    sourceBlock?: Block
    sourceId?: string
    services: WorkspaceServices
    flyout?: boolean
}

export const WorkspaceContext = createContext<WorkspaceContextProps>({
    workspace: undefined,
    dragging: false,
    sourceBlock: undefined,
    flyout: false,
    sourceId: undefined,
    services: undefined,
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
    const services = resolveWorkspaceServices(workspace)
    const [dragging, setDragging] = useState(!!workspace?.isDragging())
    const [flyout, setFlyout] = useState(!!sourceBlock?.isInFlyout)

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
                flyout,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    )
}

/* eslint-disable @typescript-eslint/ban-types */
import { Block, BlockSvg, Events, Workspace, WorkspaceSvg } from "blockly"
import React, { createContext, ReactNode, useCallback, useState } from "react"
import { WorkspaceJSON } from "./dsl/workspacejson"
import { FileSystemDirectory } from "../fs/fsdom"
import ReactField from "./fields/ReactField"
import useWorkspaceEvent from "./useWorkspaceEvent"
import { JDEventSource } from "../dom/eventsource"
import { CHANGE } from "../dom/constants"

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
    workspaceServices: WorkspaceServices
}

export function resolveWorkspaceServices(workspace: Workspace) {
    const workspaceWithServices = workspace as WorkspaceWithServices
    const services = workspaceWithServices?.workspaceServices
    return services
}

export interface FieldWithServices {
    notifyServicesChanged?: () => void
}

export const TRANSFORMED_DATA_CHANGE = "transformedDataChange"
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
            this.emit(TRANSFORMED_DATA_CHANGE)
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
    blockServices: BlockServices
}

export function resolveBlockServices(block: Block) {
    const blockWithServices = block as BlockWithServices
    const services = blockWithServices?.blockServices
    return services
}

export function resolveBlockSvg(block: Block) {
    return block as BlockSvg
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
}

export const WorkspaceContext = createContext<WorkspaceContextProps>({
    workspace: undefined,
    dragging: false,
    sourceBlock: undefined,
    sourceId: undefined,
    services: undefined,
})
WorkspaceContext.displayName = "Workspace"

export default WorkspaceContext

/**
 * A blockly context for each field
 * @param props
 * @returns
 */
export function WorkspaceProvider(props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: ReactField<any>
    children: ReactNode
}) {
    const { field, children } = props
    const sourceBlock = field?.getSourceBlock()
    const sourceId = sourceBlock?.id
    const workspace = sourceBlock?.workspace as WorkspaceSvg
    const services = resolveWorkspaceServices(workspace)
    const [dragging, setDragging] = useState(!!workspace?.isDragging())

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
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    )
}

import { Events, WorkspaceSvg, Xml } from "blockly"
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react"
import { CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import { arrayConcatMany, toMap } from "../../../jacdac-ts/src/jdom/utils"
import RoleManager from "../../../jacdac-ts/src/servers/rolemanager"
import bus from "../../jacdac/providerbus"
import useRoleManager from "../hooks/useRoleManager"
import useLocalStorage from "../hooks/useLocalStorage"
import { BlockWarning, collectWarnings } from "./blockwarning"
import { registerDataSolver } from "./dsl/datasolver"
import BlockDomainSpecificLanguage from "./dsl/dsl"
import { domToJSON } from "./jsongenerator"
import {
    JSON_WARNINGS_CATEGORY,
    NEW_PROJET_XML,
    ToolboxConfiguration,
} from "./toolbox"
import useBlocklyEvents from "./useBlocklyEvents"
import useBlocklyPlugins from "./useBlocklyPlugins"
import useToolbox, { useToolboxButtons } from "./useToolbox"
import {
    BlocklyWorkspaceWithServices,
    BlockServices,
    BlockWithServices,
    FieldWithServices,
    WorkspaceServices,
} from "./WorkspaceContext"
import AppContext from "../AppContext"
import { fileSystemHandleSupported } from "../hooks/useDirectoryHandle"
import useFileStorage from "../hooks/useFileStorage"
import BlockFile from "./blockfile"
import { WorkspaceJSON } from "../../../jacdac-ts/src/dsl/workspacejson"

export interface BlockProps {
    editorId: string
    setEditorId: (id: string) => void

    dsls: BlockDomainSpecificLanguage[]
    workspace: WorkspaceSvg
    workspaceXml: string
    workspaceJSON: WorkspaceJSON
    toolboxConfiguration: ToolboxConfiguration
    roleManager: RoleManager
    dragging: boolean
    setWorkspace: (ws: WorkspaceSvg) => void
    setWorkspaceXml: (value: string) => void
    setWarnings: (category: string, warnings: BlockWarning[]) => void

    workspaceFileHandle: FileSystemFileHandle
    setWorkspaceFileHandle: (file: FileSystemFileHandle) => void
}

const BlockContext = createContext<BlockProps>({
    editorId: "",
    setEditorId: () => {},
    dsls: [],
    workspace: undefined,
    workspaceXml: undefined,
    workspaceJSON: undefined,
    toolboxConfiguration: undefined,
    roleManager: undefined,
    dragging: false,
    setWarnings: () => {},
    setWorkspace: () => {},
    setWorkspaceXml: () => {},

    workspaceFileHandle: undefined,
    setWorkspaceFileHandle: undefined,
})
BlockContext.displayName = "Block"

const DEFAULT_XML = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'

export default BlockContext

// eslint-disable-next-line react/prop-types
export function BlockProvider(props: {
    storageKey?: string
    dsls: BlockDomainSpecificLanguage[]
    children: ReactNode
}) {
    const { storageKey, dsls, children } = props
    const { setError } = useContext(AppContext)
    const [workspaceFileHandle, setFileHandle] =
        useState<FileSystemFileHandle>()
    const [storedXml, setStoredXml] = useLocalStorage(
        storageKey,
        NEW_PROJET_XML
    )
    const setWorkspaceFileContent = useFileStorage(workspaceFileHandle)
    const roleManager = useRoleManager()
    const [workspace, setWorkspace] = useState<WorkspaceSvg>(undefined)
    const [workspaceXml, _setWorkspaceXml] = useState<string>(storedXml)
    const [workspaceJSON, _setWorkspaceJSON] =
        useState<WorkspaceJSON>(undefined)
    const [warnings, _setWarnings] = useState<
        {
            category: string
            entries: BlockWarning[]
        }[]
    >([])
    const [dragging, setDragging] = useState(false)
    const [editorId, setEditorId] = useState("")

    const setWorkspaceXml = (xml: string) => {
        _setWorkspaceXml(xml)
        setStoredXml(xml)
    }

    const setWorkspaceJSON = async (json: WorkspaceJSON) => {
        _setWorkspaceJSON(json)
        if (setWorkspaceFileContent) {
            const file: BlockFile = {
                editor: editorId,
                xml: workspaceXml,
                json,
            }
            const fileContent = JSON.stringify(file)
            await setWorkspaceFileContent(fileContent)
        }
    }

    const setWarnings = (category: string, entries: BlockWarning[]) => {
        const i = warnings.findIndex(w => w.category === category)
        _setWarnings([
            ...warnings.slice(0, i),
            {
                category,
                entries,
            },
            ...warnings.slice(i + 1),
        ])
    }

    const toolboxConfiguration = useToolbox(dsls, workspaceJSON)
    const initializeBlockServices = (block: BlockWithServices) => {
        if (block.jacdacServices?.initialized) return

        let services = block.jacdacServices
        if (!services) {
            services = block.jacdacServices = new BlockServices()
            block.inputList?.forEach(i =>
                i.fieldRow?.forEach(f =>
                    (
                        f as unknown as FieldWithServices
                    ).notifyServicesChanged?.()
                )
            )
        }
        services.initialized = true
        registerDataSolver(block)
    }

    const handleBlockChange = (blockId: string) => {
        const block = workspace.getBlockById(blockId) as BlockWithServices
        const services = block?.jacdacServices
        if (block && !block.isEnabled()) {
            services?.clearData()
        } else services?.emit(CHANGE)
    }

    const handleWorkspaceEvent = (event: {
        type: string
        workspaceId: string
    }) => {
        const { type, workspaceId } = event
        if (workspaceId !== workspace.id) return
        //console.log(`blockly: ${type}`, event)
        if (type === Events.BLOCK_DRAG) {
            const dragEvent = event as Events.BlockDrag
            setDragging(!!dragEvent.isStart)
        } else if (type === Events.FINISHED_LOADING) {
            workspace
                .getAllBlocks(false)
                .forEach(b => initializeBlockServices(b as BlockWithServices))
        } else if (type === Events.BLOCK_CREATE) {
            const bev = event as unknown as Events.BlockCreate
            const block = workspace.getBlockById(
                bev.blockId
            ) as BlockWithServices
            initializeBlockServices(block)
        } else if (type === Events.BLOCK_MOVE) {
            const cev = event as unknown as Events.BlockMove
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parentId = (cev as any).newParentId
            if (parentId) handleBlockChange(parentId)
        } else if (type === Events.BLOCK_CHANGE) {
            const cev = event as unknown as Events.BlockChange
            handleBlockChange(cev.blockId)
        }
    }

    const setWorkspaceFileHandle: (f: FileSystemFileHandle) => Promise<void> =
        fileSystemHandleSupported()
            ? async f => {
                  if (!f) {
                      setFileHandle(f)
                      return
                  }

                  try {
                      console.debug(`reading ${f.name}`)
                      const file = await f.getFile()
                      const text = await file.text()
                      const json: BlockFile = JSON.parse(text) as BlockFile
                      const { editor, xml } = json || {}
                      if (editor !== editorId)
                          throw new Error("Wrong block editor")
                      // try loading xml into a dummy blockly workspace
                      const dom = Xml.textToDom(xml || DEFAULT_XML)
                      // all good, load in workspace
                      workspace.clear()
                      Xml.domToWorkspace(dom, workspace)
                      setFileHandle(f)
                  } catch (e) {
                      setError(e)
                      setFileHandle(undefined)
                  }
              }
            : undefined

    // plugins
    useBlocklyPlugins(workspace)
    useBlocklyEvents(workspace)
    useToolboxButtons(workspace, toolboxConfiguration)

    // role manager
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ws = workspace as unknown as BlocklyWorkspaceWithServices
        const services = ws?.jacdacServices
        if (services) services.roleManager = roleManager
    }, [workspace, roleManager])
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wws = workspace as unknown as BlocklyWorkspaceWithServices
        if (wws && !wws.jacdacServices) {
            wws.jacdacServices = new WorkspaceServices()
            wws.jacdacServices.roleManager = roleManager
        }
    }, [workspace])
    useEffect(() => {
        if (!workspace || dragging) return

        const newWorkspaceJSON = domToJSON(workspace, dsls)
        if (
            JSON.stringify(newWorkspaceJSON) !== JSON.stringify(workspaceJSON)
        ) {
            setWorkspaceJSON(newWorkspaceJSON)
            const newWarnings = collectWarnings(newWorkspaceJSON)
            setWarnings(JSON_WARNINGS_CATEGORY, newWarnings)
        }
    }, [dsls, workspace, dragging, workspaceXml])
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ws = workspace as unknown as BlocklyWorkspaceWithServices
        const services = ws?.jacdacServices
        if (services) services.workspaceJSON = workspaceJSON
    }, [workspace, workspaceJSON])

    // apply errors
    useEffect(() => {
        if (!workspace) return
        const allErrors = toMap(
            arrayConcatMany(
                warnings
                    .map(w => w.entries)
                    .filter(entries => !!entries?.length)
            ),
            e => e.sourceId || "",
            e => e.message
        )
        workspace
            .getAllBlocks(false)
            .forEach(b => b.setWarningText(allErrors[b.id] || null))
    }, [workspace, warnings])

    // register block creation
    useEffect(() => {
        const handlers = [
            handleWorkspaceEvent,
            ...dsls.map(dsl => dsl.createWorkspaceChangeListener?.(workspace)),
        ].filter(c => !!c)
        handlers.forEach(handler => workspace?.addChangeListener(handler))
        return () =>
            handlers?.forEach(handler =>
                workspace?.removeChangeListener(handler)
            )
    }, [workspace, dsls])
    // don't refresh registers while dragging
    useEffect(() => {
        bus.backgroundRefreshRegisters = !dragging
    }, [dragging])
    // mounting dsts
    useEffect(() => {
        const unmounnts = dsls.map(dsl => dsl.mount?.()).filter(u => !!u)
        return () => unmounnts.forEach(u => u())
    }, [])

    return (
        <BlockContext.Provider
            value={{
                editorId,
                setEditorId,
                dsls,
                workspace,
                workspaceXml,
                workspaceJSON,
                toolboxConfiguration,
                roleManager,
                dragging,
                setWarnings,
                setWorkspace,
                setWorkspaceXml,
                workspaceFileHandle,
                setWorkspaceFileHandle,
            }}
        >
            {children}
        </BlockContext.Provider>
    )
}

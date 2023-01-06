import { Events, WorkspaceSvg, Xml } from "blockly"
import React, { createContext, ReactNode, useEffect, useState } from "react"
import useLocalStorage from "../hooks/useLocalStorage"
import { BlockWarning, collectWarnings } from "./blockwarning"
import { registerDataSolver } from "./dsl/datasolver"
import BlockDomainSpecificLanguage from "./dsl/dsl"
import { workspaceToJSON } from "./jsongenerator"
import {
    JSON_WARNINGS_CATEGORY,
    NEW_PROJET_XML,
    ToolboxConfiguration,
    WORKSPACE_FILENAME,
} from "./toolbox"
import useBlocklyEvents from "./useBlocklyEvents"
import useBlocklyPlugins from "./useBlocklyPlugins"
import useToolbox, { useToolboxButtons } from "./useToolbox"
import {
    BlockServices,
    BlockWithServices,
    FieldWithServices,
    resolveWorkspaceServices,
    WorkspaceServices,
    WorkspaceWithServices,
} from "./WorkspaceContext"
import { WorkspaceFile, WorkspaceJSON } from "./dsl/workspacejson"
import useEffectAsync from "../hooks/useEffectAsync"
import useChange from "../dom/useChange"
import { resolveBlockWarnings } from "./WorkspaceContext"
import useWindowEvent from "../hooks/useWindowEvent"
import {
    DslMessage,
    DslOptionsMessage,
    DslWorkspaceFileMessage,
} from "./dsl/iframedsl"
import { AllOptions } from "./fields/IFrameDataChooserField"
import useSnackbar from "../hooks/useSnackbar"
import useFileSystem from "../fs/FileSystemContext"
import { CHANGE } from "../dom/constants"
import { arrayConcatMany, toMap } from "../dom/utils"

export interface BlockProps {
    editorId: string

    dsls: BlockDomainSpecificLanguage[]
    workspace: WorkspaceSvg
    workspaceXml: string
    workspaceJSON: WorkspaceJSON
    workspaceSaved: WorkspaceFile
    toolboxConfiguration: ToolboxConfiguration
    dragging: boolean
    setWorkspace: (ws: WorkspaceSvg) => void
    setWorkspaceXml: (value: string) => void
    setWarnings: (category: string, warnings: BlockWarning[]) => void
    loadWorkspaceFile: (file: WorkspaceFile) => void
}

const BlockContext = createContext<BlockProps>({
    editorId: "",
    dsls: [],
    workspace: undefined,
    workspaceXml: undefined,
    workspaceJSON: undefined,
    workspaceSaved: undefined,
    toolboxConfiguration: undefined,
    dragging: false,
    setWarnings: () => {},
    setWorkspace: () => {},
    setWorkspaceXml: () => {},
    loadWorkspaceFile: file => {},
})
BlockContext.displayName = "Block"

const DEFAULT_XML = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'

export default BlockContext

// eslint-disable-next-line react/prop-types
export function BlockProvider(props: {
    editorId: string
    storageKey: string
    dsls: BlockDomainSpecificLanguage[]
    onBeforeSaveWorkspaceFile?: (file: WorkspaceFile) => void
    children: ReactNode
}) {
    const { editorId, storageKey, dsls, children, onBeforeSaveWorkspaceFile } =
        props
    const { setError } = useSnackbar()
    const { fileSystem } = useFileSystem()
    const workspaceDirectory = useChange(fileSystem, _ => _?.workingDirectory)
    const workspaceFile = useChange(workspaceDirectory, _ =>
        _?.file(WORKSPACE_FILENAME, { create: true })
    )
    const [storedXml, setStoredXml] = useLocalStorage(
        storageKey,
        NEW_PROJET_XML
    )
    const [workspace, setWorkspace] = useState<WorkspaceSvg>(undefined)
    const [workspaceXml, _setWorkspaceXml] = useState<string>(storedXml)
    const [workspaceJSON, setWorkspaceJSON] = useState<WorkspaceJSON>(undefined)
    const [workspaceSaved, setWorkspaceSaved] =
        useState<WorkspaceFile>(undefined)
    const [warnings, _setWarnings] = useState<
        {
            category: string
            entries: BlockWarning[]
        }[]
    >([])
    const [dragging, setDragging] = useState(false)

    const setWorkspaceXml = (xml: string) => {
        _setWorkspaceXml(xml)
        setStoredXml(xml)
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
    const loadWorkspaceFile = (file: WorkspaceFile) => {
        const { editor, xml } = file || {
            editor: editorId,
            xml: NEW_PROJET_XML,
        }
        if (editor && editor !== editorId)
            throw new Error(`wrong block editor (${editor} != ${editorId}`)
        // try loading xml into a dummy blockly workspace
        const dom = Xml.textToDom(xml || DEFAULT_XML)
        // all good, load in workspace
        workspace.clear()
        Xml.domToWorkspace(dom, workspace)
    }

    const toolboxConfiguration = useToolbox(dsls, workspaceJSON)
    const initializeBlockServices = (block: BlockWithServices) => {
        if (!block || block?.blockServices?.initialized) return

        let services = block.blockServices
        if (!services) services = block.blockServices = new BlockServices()
        block.inputList?.forEach(i =>
            i.fieldRow?.forEach(f => {
                const fs = f as unknown as FieldWithServices
                fs?.notifyServicesChanged?.()
            })
        )
        services.initialized = true
        registerDataSolver(block)
    }

    const handleBlockChange = (blockId: string) => {
        const block = workspace.getBlockById(blockId) as BlockWithServices
        const services = block?.blockServices
        if (block && !block.isEnabled()) {
            services?.clearData()
        } else services?.emit(CHANGE)
    }
    const initAllBlockServices = () =>
        workspace
            ?.getAllBlocks(false)
            .forEach(b => initializeBlockServices(b as BlockWithServices))
    const handleWorkspaceEvent = (event: {
        type: string
        workspaceId: string
    }) => {
        const { type, workspaceId } = event
        if (workspaceId !== workspace.id) return
        if (type === Events.BLOCK_DRAG) {
            const dragEvent = event as Events.BlockDrag
            setDragging(!!dragEvent.isStart)
        } else if (type === Events.FINISHED_LOADING) {
            initAllBlockServices()
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

    // mounting dsts
    useEffect(() => {
        const unmounnts = dsls
            .map(dsl => dsl.mount?.(workspace))
            .filter(u => !!u)
        return () => {
            unmounnts.forEach(u => u())
        }
    }, [workspace])

    // plugins
    useBlocklyPlugins(workspace)
    useBlocklyEvents(workspace)
    useToolboxButtons(workspace, toolboxConfiguration)

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wws = workspace as unknown as WorkspaceWithServices
        if (wws && !wws.workspaceServices) {
            wws.workspaceServices = new WorkspaceServices()
        }
    }, [workspace])
    useEffect(() => {
        const services = resolveWorkspaceServices(workspace)
        if (services) services.workingDirectory = workspaceDirectory
    }, [workspace, workspaceDirectory])
    useEffect(() => {
        if (!workspace || dragging) return

        const newWorkspaceJSON = workspaceToJSON(workspace, dsls)
        setWorkspaceJSON(newWorkspaceJSON)
        const newWarnings = collectWarnings(newWorkspaceJSON)
        setWarnings(JSON_WARNINGS_CATEGORY, newWarnings)
    }, [dsls, workspace, dragging, workspaceXml])
    useEffectAsync(
        async mounted => {
            if (!workspaceFile) return
            try {
                const text = await workspaceFile.textAsync()
                if (!mounted()) return

                const json = JSON.parse(text) as WorkspaceFile
                loadWorkspaceFile(json)
            } catch (e) {
                if (mounted()) setError(e)
                if (fileSystem) fileSystem.workingDirectory = undefined
            }
        },
        [workspaceFile]
    )
    useEffectAsync(async () => {
        const file: WorkspaceFile = {
            editor: editorId,
            xml: workspaceXml,
            json: workspaceJSON,
        }
        dsls.forEach(dsl => dsl.onBeforeSaveWorkspaceFile?.(file))
        onBeforeSaveWorkspaceFile?.(file)
        dsls.forEach(dsl => dsl.onSave?.(file))
        if (workspaceFile) {
            const fileContent = JSON.stringify(file)
            workspaceFile?.write(fileContent)
        }
        setWorkspaceSaved(file)
    }, [editorId, workspaceFile, workspaceXml, workspaceJSON])
    useEffect(() => {
        const services = resolveWorkspaceServices(workspace)
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
            .forEach(b =>
                b.setWarningText(allErrors[b.id] || resolveBlockWarnings(b))
            )
    }, [workspace, warnings])

    // register block creation
    useEffect(() => {
        const handlers = [
            handleWorkspaceEvent,
            ...dsls.map(dsl => dsl.createWorkspaceChangeListener?.(workspace)),
        ].filter(c => !!c)
        handlers.forEach(handler => workspace?.addChangeListener(handler))
        initAllBlockServices()
        return () =>
            handlers?.forEach(handler =>
                workspace?.removeChangeListener(handler)
            )
    }, [workspace, dsls])

    // load message from parent
    useWindowEvent(
        "message",
        (msg: MessageEvent<DslMessage>) => {
            const { data } = msg
            const { type, action } = data
            if (type === "dsl") {
                switch (action) {
                    case "load":
                        console.debug(`dsl load`, data)
                        try {
                            loadWorkspaceFile(data as DslWorkspaceFileMessage)
                        } catch (e) {
                            console.error(e)
                        }
                        break
                    case "options": {
                        const options: Record<string, [string, string][]> = (
                            data as DslOptionsMessage
                        ).options
                        console.debug(`dsl: received options`, options)
                        Object.entries(options || {}).forEach(
                            ([key, value]) => (AllOptions[key] = value)
                        )
                    }
                }
            }
        },
        false,
        []
    )

    return (
        <BlockContext.Provider
            value={{
                editorId,
                dsls,
                workspace,
                workspaceXml,
                workspaceJSON,
                workspaceSaved,
                toolboxConfiguration,
                dragging,
                setWarnings,
                setWorkspace,
                setWorkspaceXml,
                loadWorkspaceFile,
            }}
        >
            {children}
        </BlockContext.Provider>
    )
}

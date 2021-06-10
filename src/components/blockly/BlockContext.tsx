import { WorkspaceSvg } from "blockly"
import React, { createContext, ReactNode, useEffect, useState } from "react"
import { toMap } from "../../../jacdac-ts/src/jdom/utils"
import RoleManager from "../../../jacdac-ts/src/servers/rolemanager"
import useRoleManager from "../hooks/useRoleManager"
import useLocalStorage from "../useLocalStorage"
import BlockDomainSpecificLanguage from "./dsl/dsl"
import { domToJSON, WorkspaceJSON } from "./jsongenerator"
import { NEW_PROJET_XML, ToolboxConfiguration } from "./toolbox"
import useBlocklyEvents from "./useBlocklyEvents"
import useBlocklyPlugins from "./useBlocklyPlugins"
import useToolbox, { useToolboxButtons } from "./useToolbox"
import {
    BlocklyWorkspaceWithServices,
    WorkspaceServices,
} from "./WorkspaceContext"

export interface BlockWarning {
    blockId: string
    message: string
}

export interface BlockProps {
    dsls: BlockDomainSpecificLanguage[]
    workspace: WorkspaceSvg
    workspaceXml: string
    workspaceJSON: WorkspaceJSON
    toolboxConfiguration: ToolboxConfiguration
    roleManager: RoleManager
    setWorkspace: (ws: WorkspaceSvg) => void
    setWorkspaceXml: (value: string) => void
    setWarnings: (warnings: BlockWarning[]) => void
}

const BlockContext = createContext<BlockProps>({
    dsls: [],
    workspace: undefined,
    workspaceXml: undefined,
    workspaceJSON: undefined,
    toolboxConfiguration: undefined,
    roleManager: undefined,
    setWarnings: () => {},
    setWorkspace: () => {},
    setWorkspaceXml: () => {},
})
BlockContext.displayName = "Block"

export default BlockContext

// eslint-disable-next-line react/prop-types
export function BlockProvider(props: {
    storageKey?: string
    dsls: BlockDomainSpecificLanguage[]
    children: ReactNode
}) {
    const { storageKey, dsls, children } = props
    const [storedXml, setStoredXml] = useLocalStorage(
        storageKey,
        NEW_PROJET_XML
    )
    const roleManager = useRoleManager()
    const [workspace, setWorkspace] = useState<WorkspaceSvg>(undefined)
    const [workspaceXml, _setWorkspaceXml] = useState<string>(storedXml)
    const [workspaceJSON, setWorkspaceJSON] = useState<WorkspaceJSON>(undefined)
    const [warnings, setWarnings] = useState<BlockWarning[]>([])

    const setWorkspaceXml = (xml: string) => {
        setStoredXml(xml)
        _setWorkspaceXml(xml)
    }

    const toolboxConfiguration = useToolbox(dsls, workspaceJSON)

    // plugins
    useBlocklyPlugins(workspace)
    useBlocklyEvents(workspace)
    useToolboxButtons(workspace, toolboxConfiguration)

    // role manager
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ws = workspace as any as BlocklyWorkspaceWithServices
        const services = ws?.jacdacServices
        if (services) services.roleManager = roleManager
    }, [workspace, roleManager])

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wws = workspace as any as BlocklyWorkspaceWithServices
        if (wws && !wws.jacdacServices) {
            wws.jacdacServices = new WorkspaceServices()
            wws.jacdacServices.roleManager = roleManager
        }
    }, [workspace])
    useEffect(() => {
        if (!workspace || workspace.isDragging()) return

        const newWorkspaceJSON = domToJSON(workspace, dsls)
        if (
            JSON.stringify(newWorkspaceJSON) !== JSON.stringify(workspaceJSON)
        ) {
            setWorkspaceJSON(newWorkspaceJSON)
        }
    }, [dsls, workspace, workspaceXml])

    // apply errors
    useEffect(() => {
        if (!workspace) return
        const allErrors = toMap(
            warnings || [],
            e => e.blockId,
            e => e.message
        )
        workspace
            .getAllBlocks(false)
            .forEach(b => b.setWarningText(allErrors[b.id] || null))
    }, [workspace, warnings])

    return (
        <BlockContext.Provider
            value={{
                dsls,
                workspace,
                workspaceXml,
                workspaceJSON,
                toolboxConfiguration,
                roleManager,
                setWarnings,
                setWorkspace,
                setWorkspaceXml,
            }}
        >
            {children}
        </BlockContext.Provider>
    )
}

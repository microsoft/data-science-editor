import { JDBus } from "../../../jacdac-ts/src/jdom/bus"
import React, { createContext, useContext, useState } from "react"
import useSnackbar from "../hooks/useSnackbar"
import useWindowEvent from "../hooks/useWindowEvent"
import useBus from "../../jacdac/useBus"
import { inIFrame } from "../../../jacdac-ts/src/jdom/iframeclient"

export const MESSAGE_TYPE = "jacdac-command"

export interface CommandOptions {
    id: string
    description: string
    help?: () => string // markdown
    handler: (bus: JDBus, args: unknown) => Promise<void>
}

export interface Command {
    type: "jacdac-command"
    // message id
    id?: string
    command: unknown
    args?: unknown
}

export interface CommandPaletteContextProps {
    commands: CommandOptions[]
    addCommands(commands: CommandOptions[]): () => void
    runCommand(id: string, args?: unknown): Promise<void>
}

export const CommandPaletteContext = createContext<CommandPaletteContextProps>({
    commands: [],
    addCommands: () => undefined,
    runCommand: () => undefined,
})
CommandPaletteContext.displayName = "commands"

export function useCommandPalette(): CommandPaletteContextProps {
    const ctx = useContext(CommandPaletteContext)
    if (!ctx) throw Error("Command palette context missing")
    return ctx
}

// eslint-disable-next-line react/prop-types
export const CommandPaletteProvider = ({ children }) => {
    const bus = useBus()
    const { setError } = useSnackbar()
    const [commands, setCommands] = useState<CommandOptions[]>([])

    const addCommands = (options: CommandOptions[]) => {
        if (!options) return undefined

        const ids = options.map(c => c.id)
        options.forEach(option => {
            const { id } = option
            if (commands.find(c => c.id === id))
                throw Error(`command ${id} already registered`)
        })
        setCommands([...commands, ...options])
        console.debug(`command: added ${ids.join(", ")}`)
        return () => {
            setCommands(commands.filter(c => ids.indexOf(c.id) < 0))
            console.debug(`command: removed ${ids.join(", ")}`)
        }
    }
    const runCommandUnsafe = async (id: string, args: unknown) => {
        console.debug(`command: running ${id}`)
        const cmd = commands.find(c => c.id === id)
        if (!cmd) throw Error(`command ${id} not found`)
        return cmd.handler(bus, args)
    }
    const runCommand = async (id: string, args: unknown) => {
        try {
            return await runCommandUnsafe(id, args)
        } catch (e) {
            setError(e)
            throw e
        }
    }
    useWindowEvent("message", ev => {
        const data = ev.data || {}
        const { type } = data
        if (type !== MESSAGE_TYPE) return

        const { id, command, args } = data

        const p = runCommandUnsafe(command, args)
        if (p && id && inIFrame()) {
            p.then(() => {
                window.parent.postMessage({
                    ...data,
                    result: "success",
                })
            }).catch(e => {
                console.debug(e)
                window.parent.postMessage({
                    ...data,
                    result: "error",
                    error: e.message,
                })
            })
        }
    })

    return (
        <CommandPaletteContext.Provider
            value={{ commands, addCommands, runCommand }}
        >
            {children}
        </CommandPaletteContext.Provider>
    )
}

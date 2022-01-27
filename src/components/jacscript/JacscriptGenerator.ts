import jsep from "jsep"
import {
    VMBase,
    VMHandler,
    VMProgram,
    VMRole,
    VMIfThenElse,
    VMError,
} from "../../../jacdac-ts/src/vm/ir"
import { RoleEvent, toIdentifier } from "../../../jacdac-ts/src/vm/compile"
import {
    BUILTIN_TYPES,
    resolveBlockDefinition,
    ServiceBlockDefinition,
} from "../blockly/toolbox"
import Blockly from "blockly"
import BlockDomainSpecificLanguage, { resolveDsl } from "../blockly/dsl/dsl"
import { parseRoleType } from "../blockly/dsl/servicesbase"
import { BlockJSON, WorkspaceJSON } from "../blockly/dsl/workspacejson"
import { splitFilter } from "../../../jacdac-ts/src/jdom/utils"

export interface ExpressionWithErrors {
    expr: jsep.Expression
    errors: VMError[]
}

export interface CmdWithErrors {
    cmd: VMBase
    errors: VMError[]
}

export const makeVMBase = (block: BlockJSON, command: jsep.CallExpression) => {
    return {
        sourceId: block.id,
        type: "cmd",
        command,
    } as VMBase
}

export const processErrors = (block: BlockJSON, errors: VMError[]) => {
    return errors.map((e: VMError) => {
        return {
            sourceId: e.sourceId ? e.sourceId : block.id,
            message: e.message,
        }
    })
}

export default function workspaceJSONToJacScriptProgram(
    workspace: WorkspaceJSON,
    dsls: BlockDomainSpecificLanguage[]
): VMProgram {
    //console.debug(`compile vm`, { workspace, dsls })

    if (!workspace) return undefined

    const [roles, serverRoles]: [VMRole[], VMRole[]] = splitFilter(
        workspace.variables
            .filter(v => BUILTIN_TYPES.indexOf(v.type) < 0)
            .map(parseRoleType)
            .filter(r => !isNaN(r.serviceClass)),
        r => r.client
    )

    class EmptyExpression extends Error {}

    const blockToExpression: (
        ev: RoleEvent,
        block: BlockJSON
    ) => ExpressionWithErrors = (ev: RoleEvent, blockIn: BlockJSON) => {
        const errors: VMError[] = []

        const blockToExpressionInner = (ev: RoleEvent, block: BlockJSON) => {
            if (!block) {
                throw new EmptyExpression()
            }
            const { type, value, inputs } = block
            //console.log(`block2e`, { ev, block, type, value, inputs })

            if (value !== undefined)
                if (type === "text")
                    // literal
                    return <jsep.Literal>{
                        type: "Literal",
                        value: value,
                        raw: `"${value}"`,
                    }
                // literal
                else
                    return <jsep.Literal>{
                        type: "Literal",
                        value: value,
                        raw: value + "",
                    }

            const dsl = resolveDsl(dsls, type)
            if (!dsl) {
                console.warn(`unknown block ${type}`, {
                    type,
                    ev,
                    block,
                    d: Blockly.Blocks[type],
                })
                errors.push({
                    sourceId: block.id,
                    message: `unknown block ${type}`,
                })
            } else {
                const definition =
                    resolveBlockDefinition<ServiceBlockDefinition>(type)
                const res = dsl.compileExpressionToVM?.({
                    event: ev,
                    definition,
                    block,
                    blockToExpressionInner,
                })
                if (res) {
                    if (res.errors) res.errors.forEach(e => errors.push(e))
                    return res.expr
                }

                const { template } = definition
                if (template === "shadow") {
                    const field = inputs[0].fields["value"]
                    const v = field.value
                    return <jsep.Literal>{
                        type: "Literal",
                        value: v,
                        raw: v + "",
                    }
                }

                errors.push({
                    sourceId: block.id,
                    message: `unknown block ${type}`,
                })
                console.warn(`unsupported expression block ${type}`, {
                    ev,
                    block,
                    definition,
                })
            }
            throw new EmptyExpression()
        }
        return {
            expr: blockToExpressionInner(ev, blockIn),
            errors,
        }
    }

    const blockToCommand = (
        event: RoleEvent,
        block: BlockJSON
    ): CmdWithErrors => {
        const { type, inputs } = block
        //console.debug(`block2c`, { event, type, block, inputs })
        switch (type) {
            case "dynamic_if": {
                const thenHandler: VMHandler = {
                    commands: [],
                    errors: [],
                }
                const elseHandler: VMHandler = {
                    commands: [],
                    errors: [],
                }
                const t = inputs[1]?.child
                const e = inputs[2]?.child
                if (t) {
                    addCommands(
                        event,
                        [t, ...(t.children ? t.children : [])],
                        thenHandler
                    )
                }
                if (e) {
                    addCommands(
                        event,
                        [e, ...(e.children ? e.children : [])],
                        elseHandler
                    )
                }
                let exprErrors: ExpressionWithErrors = undefined
                try {
                    exprErrors = blockToExpression(event, inputs[0]?.child)
                } catch (e) {
                    if (e instanceof EmptyExpression) {
                        exprErrors = {
                            expr: {
                                type: "Literal",
                                value: false,
                                raw: "false ",
                            } as jsep.Literal,
                            errors: [],
                        }
                    } else {
                        throw e
                    }
                }
                const { expr, errors } = exprErrors

                const ifThenElse: VMIfThenElse = {
                    sourceId: block.id,
                    type: "ite",
                    expr,
                    then: thenHandler.commands,
                    else: elseHandler.commands,
                }

                console.log("dynamic if")
                return {
                    cmd: ifThenElse,
                    errors: processErrors(
                        block,
                        errors
                            .concat(thenHandler.errors)
                            .concat(elseHandler.errors)
                    ),
                }
            }
            // more builts
            default: {
                const dsl = resolveDsl(dsls, type)
                if (dsl) {
                    const definition =
                        resolveBlockDefinition<ServiceBlockDefinition>(type)
                    const template = definition?.template
                    if (template === "meta") return undefined
                    const dslRes = dsl.compileCommandToVM?.({
                        event,
                        block,
                        definition,
                        blockToExpression,
                    })
                    if (dslRes) {
                        dslRes.errors = processErrors(block, dslRes.errors)
                        return dslRes
                    }
                }
                console.warn(`unsupported command block ${type}`, { block })
                return {
                    cmd: undefined,
                    errors: [
                        {
                            sourceId: block.id,
                            message: `unsupported command block ${type}`,
                        },
                    ],
                }
            }
        }
    }

    const nop = {
        type: "CallExpression",
        arguments: [],
        callee: toIdentifier("nop"),
    } as jsep.CallExpression

    const addCommands = (
        event: RoleEvent,
        blocks: BlockJSON[],
        handler: VMHandler
    ) => {
        blocks
            ?.filter(child => !!child)
            .forEach(child => {
                try {
                    const { cmd, errors } = blockToCommand(event, child) || {}
                    if (cmd) handler.commands.push(cmd)
                    errors?.forEach(e => handler.errors.push(e))
                } catch (e) {
                    if (e instanceof EmptyExpression) {
                        handler.commands.push({
                            sourceId: child.id,
                            type: "cmd",
                            command: nop,
                        } as VMBase)
                    } else {
                        console.debug(e)
                    }
                }
            })
    }

    const handlers: VMHandler[] = workspace.blocks
        .map(top => {
            const { type } = top
            let command: jsep.CallExpression
            let topEvent: RoleEvent
            let topErrors: VMError[]
            let topMeta = false

            try {
                const dsl = resolveDsl(dsls, type)
                const definition =
                    resolveBlockDefinition<ServiceBlockDefinition>(type)
                const { expression, errors, event, meta } =
                    dsl?.compileEventToVM?.({
                        block: top,
                        definition,
                        blockToExpression,
                    }) || {}
                command = expression as jsep.CallExpression
                topErrors = errors
                topEvent = event
                topMeta = meta

                // if dsl didn't compile anything try again
                const { template } = definition || {}
                if (!command && !topErrors?.length) {
                    switch (template) {
                        case "meta": {
                            break
                        }
                        default: {
                            topErrors = [
                                {
                                    sourceId: top.id,
                                    message: `unsupported handler block ${type}`,
                                },
                            ]
                            console.debug(
                                `unsupported handler template ${template} for ${type}`,
                                { top }
                            )
                            break
                        }
                    }
                }
            } catch (e) {
                console.debug(e)
                if (e instanceof EmptyExpression) {
                    return undefined
                } else {
                    throw e
                }
            }

            // nothing to compile here
            if (!command && !topErrors?.length) return undefined

            const handler: VMHandler = {
                commands: [
                    {
                        sourceId: top.id,
                        type: "cmd",
                        command,
                    } as VMBase,
                ],
                errors: topErrors || [],
                meta: !!topMeta,
            }

            addCommands(topEvent, top.children, handler)
            return handler
        })
        .filter(handler => !!handler)

    return {
        roles,
        serverRoles,
        handlers,
    }
}

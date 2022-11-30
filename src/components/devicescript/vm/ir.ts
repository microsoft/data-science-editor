import jsep from "jsep"

export interface VMError {
    sourceId?: string
    code?: number
    message: string
}

export interface VMBase {
    type: "ite" | "cmd"
    sourceId?: string
}

export interface VMIfThenElse extends VMBase {
    type: "ite"
    expr: jsep.Expression
    then?: VMBase[]
    else?: VMBase[]
}

export interface VMCommand extends VMBase {
    type: "cmd"
    command: jsep.CallExpression
}

export interface VMHandler {
    commands: VMBase[]
    roles?: string[]
    errors?: VMError[]
    // this handler support the editing experience but
    // should not be compiled down or debugged
    meta?: boolean
}

export interface VMRole {
    role: string
    serviceClass: number
}

export interface VMProgram {
    roles: VMRole[]
    handlers: VMHandler[]
}

export type VMFunctionNames =
    | "start"
    | "halt"
    | "nop"
    | "label"
    | "jump"
    | "branchOnCondition"
    | "wait"
    | "awaitRegister"
    | "awaitChange"
    | "awaitEvent"
    | "awaitCondition"
    | "writeRegister"
    | "writeLocal"
    | "watch"
    | "log"
    | "roleBound"
    | "roleBoundExpression"
    | "onRoleConnected"
    | "onRoleDisconnected"
    | "raiseEvent"
    | "wait"
    | "every"

type Context = "command" | "expression" | "either"

export interface VMFunctionDescription {
    id: string
    args: (string | [string, any])[]
    context: Context
}

export const VMFunctions: VMFunctionDescription[] = [
    {
        id: "start",
        args: [],
        context: "command",
    },
    {
        id: "halt",
        args: [],
        context: "command",
    },
    {
        id: "nop",
        args: [],
        context: "command",
    },
    {
        id: "label",
        args: ["Identifier"],
        context: "command",
    },
    {
        id: "jump",
        args: ["Identifier"],
        context: "command",
    },
    {
        id: "branchOnCondition",
        args: ["boolean", "Identifier"],
        context: "command",
    },
    {
        id: "wait",
        args: ["number"],
        context: "command",
    },
    {
        id: "awaitRegister",
        args: ["register"],
        context: "command",
    },
    {
        id: "awaitChange",
        args: ["register", "number"],
        context: "command",
    },
    {
        id: "awaitEvent",
        args: ["event", ["boolean", true]],
        context: "command",
    },
    {
        id: "awaitCondition",
        args: ["boolean"],
        context: "command",
    },
    {
        id: "writeRegister",
        args: ["register", "number"],
        context: "command",
    },
    {
        id: "writeLocal",
        args: ["register", "number"],
        context: "command",
    },
    {
        id: "watch",
        args: ["number"],
        context: "command",
    },
    {
        id: "log",
        args: ["number"],
        context: "command",
    },
    {
        id: "roleBound",
        args: ["Identifier", "Identifier"],
        context: "command",
    },
    {
        id: "roleBoundExpression",
        args: ["Identifier"],
        context: "expression",
    },
    {
        id: "onRoleConnected",
        args: ["Identifier"],
        context: "command",
    },
    {
        id: "onRoleDisconnected",
        args: ["Identifier"],
        context: "command",
    },
]

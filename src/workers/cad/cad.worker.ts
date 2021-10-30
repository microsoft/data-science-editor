/* eslint-disable @typescript-eslint/ban-types */
import { convertToSTL, EnclosureModel, EnclosureOptions } from "./enclosurecad"

export interface CadMessage {
    worker: "cad"
    id?: string
    type: string
}

export interface CadRequest extends CadMessage {
    type: string
}

export interface CadConvertRequest extends CadRequest {
    type: "convert"
    model: EnclosureModel
    options?: EnclosureOptions
}

export interface CadConvertResponse extends CadMessage {
    stl: Blob
}

const handlers: { [index: string]: (msg: CadMessage) => Promise<object> } = {
    convert: async (msg: CadConvertRequest) => {
        const { model, options } = msg
        const stl = convertToSTL(model, options)
        return { stl }
    },
}

async function handleMessage(event: MessageEvent) {
    const message: CadRequest = event.data
    const { id, worker, type } = message
    if (worker !== "cad") return

    try {
        const handler = handlers[type]
        const resp = await handler(message)
        self.postMessage({
            id,
            worker,
            ...resp,
        })
    } catch (e) {
        self.postMessage({
            id,
            worker,
            error: e + "",
        })
    }
}

self.addEventListener("message", handleMessage)
console.debug(`jacdac cad: worker registered`)

export interface VMMessage {
    worker: "vm"
    id?: string
}

export interface VMRequest extends VMMessage {
    type?: string
}

async function handleMessage(event: MessageEvent) {
    const message: VMRequest = event.data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { worker, ...rest } = message
    if (worker !== "vm") return

    // do something
    const resp = { worker, ...rest }

    self.postMessage(resp)
}

self.addEventListener("message", handleMessage)
console.debug(`jacdac vm: worker registered`)

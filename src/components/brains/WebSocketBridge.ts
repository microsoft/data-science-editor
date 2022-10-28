import { JDBridge } from "../../../jacdac-ts/src/jdom/bridge"

export default class WebSocketBridge extends JDBridge {
    private _ws: WebSocket
    private _startPromise: Promise<void>

    constructor(readonly url: string, readonly protocols?: string | string[]) {
        super("brain", true)

        this.mount(() => this.close())
    }

    private close() {
        console.debug(`web bridge closed`, { url: this.url })
        try {
            this._ws?.close()
            this._ws = undefined
            this._startPromise = undefined
        } catch (e) {
            console.warn(e)
        }
    }

    async connect() {
        if (this._ws) return Promise.resolve()
        if (!this._startPromise) {
            this._startPromise = new Promise<void>((resolve, reject) => {
                const ws = new WebSocket(this.url, this.protocols)
                ws.binaryType = "arraybuffer"
                ws.onopen = () => {
                    console.debug(`web bridge opened`, { url: this.url })
                    resolve()
                }
                ws.onerror = e => {
                    console.debug(`web bridge error`, { url: this.url })
                    this.close()
                    reject()
                }
                ws.onclose = () => {
                    this.close()
                }
                ws.onmessage = (ev: MessageEvent<ArrayBuffer>) => {
                    const { data } = ev
                    const buffer = new Uint8Array(data)
                    this.receiveFrameOrPacket(buffer)
                }
            })
        }
        return this._startPromise
    }

    protected sendPacket(data: Uint8Array, sender: string): void {
        this.connect()
        this._ws?.send(data)
    }
}

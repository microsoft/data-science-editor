import { inIFrame } from "../../../../jacdac-ts/src/jdom/iframeclient"
import { randomDeviceId } from "../../../../jacdac-ts/src/jdom/random"
import { workspaceToJSON } from "../jsongenerator"
import {
    BlockDataSet,
    BlockDataSetTransform,
    BlockDefinition,
    ContentDefinition,
} from "../toolbox"
import { setBlockDataWarning } from "../WorkspaceContext"
import BlockDomainSpecificLanguage, {
    CreateBlocksOptions,
    CreateCategoryOptions,
} from "./dsl"
import { WorkspaceJSON } from "./workspacejson"

export interface DslMessage {
    type?: "dsl"
    id: string
    dslid: string
    action: "mount" | "unmount" | "blocks" | "transform"
}

export interface DslBlocksResponse extends DslMessage {
    action: "blocks"
    blocks: BlockDefinition[]
    category: ContentDefinition[]
}

export interface DslTransformMessage extends DslMessage {
    action: "transform"
    blockId?: string
    workspace?: WorkspaceJSON
    dataset?: BlockDataSet
}

export interface DslTransformResponse extends DslTransformMessage {
    warning?: string
}

class IFrameDomainSpecificLanguage implements BlockDomainSpecificLanguage {
    readonly id = "iframe"
    private dslid = randomDeviceId()
    private blocks: BlockDefinition[] = []
    private category: ContentDefinition[] = []
    private pendings: Record<string, (data: DslMessage) => void> = {}

    constructor(readonly targetOrigin: string) {
        this.handleMessage = this.handleMessage.bind(this)
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    private post(action: string, extras?: object) {
        const payload = {
            id: Math.random() + "",
            type: "dsl",
            dslid: this.dslid,
            action,
            ...(extras || {}),
        } as DslMessage
        window.parent.postMessage(payload, this.targetOrigin)
        return payload
    }

    mount() {
        window.addEventListener("message", this.handleMessage)
        this.post("mount")
        return () => {
            this.post("unmount")
            window.removeEventListener("message", this.handleMessage)
        }
    }

    private handleMessage(msg: MessageEvent<DslMessage>) {
        const { data } = msg
        if (data.type === "dsl" && data.dslid === this.dslid) {
            const { id } = data
            const pending = this.pendings[id]
            if (pending) {
                delete this.pendings[id]
                pending(data)
            }
        }
    }

    private createTransformData(): BlockDataSetTransform {
        return (blockWithServices, dataset) =>
            new Promise<BlockDataSet>(resolve => {
                const workspace = workspaceToJSON(
                    blockWithServices.workspace,
                    [], // TODO pass dsls
                    [blockWithServices]
                )
                const { id } = this.post("transform", {
                    blockId: blockWithServices.id,
                    workspace,
                    dataset,
                })
                setTimeout(() => {
                    if (this.pendings[id]) {
                        delete this.pendings[id]
                        console.warn(`iframedsl: transform timeouted`)
                        resolve(undefined)
                    }
                }, 10000)
                this.pendings[id] = data => {
                    const { dataset, warning } = data as DslTransformResponse
                    if (warning) setBlockDataWarning(blockWithServices, warning)
                    resolve(dataset)
                }
            })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createBlocks(options: CreateBlocksOptions): Promise<BlockDefinition[]> {
        console.debug(`iframedsl: query blocks`)
        return new Promise<BlockDefinition[]>(resolve => {
            const { id } = this.post("blocks")
            setTimeout(() => {
                if (this.pendings[id]) {
                    delete this.pendings[id]
                    console.warn(`iframedsl: no blocks returned, giving up`)
                    resolve(this.blocks)
                }
            }, 1000)
            this.pendings[id] = data => {
                const bdata = data as DslBlocksResponse
                this.blocks = bdata.blocks
                this.category = bdata.category
                const transformData = this.createTransformData()
                this.blocks.forEach(
                    block => (block.transformData = transformData)
                )
                resolve(this.blocks)
            }
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createCategory(options: CreateCategoryOptions): ContentDefinition[] {
        return this.category
    }
}

/**
 * Creates an iframe DSL if applicable
 * @param targetOrigin
 * @returns
 */
export function createIFrameDSL(
    targetOrigin = "*"
): BlockDomainSpecificLanguage {
    return inIFrame() && new IFrameDomainSpecificLanguage(targetOrigin)
}

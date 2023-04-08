import { Block, Workspace } from "blockly";
import { CHANGE } from "../../dom/constants";
import { inIFrame } from "../../dom/utils";
import { workspaceToJSON } from "../jsongenerator";
import {
    BlockDataSet,
    BlockDataSetTransform,
    BlockDefinition,
    ContentDefinition,
    resolveBlockDefinition,
} from "../toolbox";
import { BlockWithServices, setBlockDataWarning } from "../WorkspaceContext";
import BlockDomainSpecificLanguage, {
    CreateBlocksOptions,
    CreateCategoryOptions,
} from "./dsl";
import { WorkspaceFile, WorkspaceJSON } from "./workspacejson";
import { parseCSV } from "./workers/csv.proxy";

export interface DslMessage {
    type?: "dsl";
    id?: string;
    dslid: string;
    action:
        | "mount"
        | "unmount"
        | "blocks"
        | "transform"
        | "change"
        | "workspace"
        | "load"
        | "save"
        | "options"
        | "style";
}

export interface DslStyleMessage extends DslMessage {
    action: "style";
    style: string;
}

export interface DslBlocksResponse extends DslMessage {
    action: "blocks";
    blocks: BlockDefinition[];
    category: ContentDefinition[];
}

export interface DslTransformMessage extends DslMessage {
    action: "transform";
    blockId?: string;
    workspace?: WorkspaceJSON;
    dataset?: BlockDataSet;
}

export interface DslTransformResponse extends DslTransformMessage {
    warning?: string;
    datasetSource?: string;
}

export type DslWorkspaceFileMessage = {
    action: "load" | "save";
} & DslMessage &
    WorkspaceFile;

export interface DslOptionsMessage extends DslMessage {
    action: "options";
    options: Record<string, [string, string][]>;
}

class IFrameDomainSpecificLanguage implements BlockDomainSpecificLanguage {
    private dslid = Math.random() + "";
    private blocks: BlockDefinition[] = [];
    private category: ContentDefinition[] = [];
    private pendings: Record<string, (data: DslMessage) => void> = {};

    private _workspace: Workspace;

    constructor(
        readonly id: string,
        readonly postMessage: (payload: any) => void
    ) {
        this.handleMessage = this.handleMessage.bind(this);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    private post(action: string, extras?: object) {
        const payload = {
            id: Math.random() + "",
            type: "dsl",
            dslid: this.dslid,
            action,
            ...(extras || {}),
        } as DslMessage;
        this.postMessage(payload);
        return payload;
    }

    mount(workspace: Workspace) {
        this._workspace = workspace;
        window.addEventListener("message", this.handleMessage, false);
        this.post("mount");
        return () => {
            this.post("unmount");
            this._workspace = undefined;
            window.removeEventListener("message", this.handleMessage);
        };
    }

    private handleMessage(msg: MessageEvent<DslMessage>) {
        const { data } = msg;
        if (data.type === "dsl" && data.dslid === this.dslid) {
            const { id, action } = data;
            // check for pending request
            const pending = id !== undefined && this.pendings[id];
            if (pending) {
                delete this.pendings[id];
                pending(data);
            }
            // trigger recomputation
            switch (action) {
                case "change": {
                    //console.log(`iframedsl: change requested`)
                    this._workspace
                        .getTopBlocks(false)
                        .filter(
                            b => resolveBlockDefinition(b.type)?.dsl === this.id
                        )
                        .forEach((b: Block) => {
                            //console.log(`change ${b.id}`)
                            const { blockServices } = b as BlockWithServices;
                            blockServices.emit(CHANGE);
                        });
                    break;
                }
                case "workspace": {
                    break;
                }
            }
        }
    }

    private createTransformData(): BlockDataSetTransform {
        return (blockWithServices, dataset) =>
            new Promise<BlockDataSet>(resolve => {
                // TODO fix event ordering
                const workspace = workspaceToJSON(
                    blockWithServices.workspace,
                    [], // TODO pass dsls
                    [blockWithServices]
                );
                const { id } = this.post("transform", {
                    blockId: blockWithServices.id,
                    workspace,
                    dataset,
                });
                setTimeout(() => {
                    if (this.pendings[id]) {
                        delete this.pendings[id];
                        console.warn(`iframedsl: transform timeout`);
                        resolve(undefined);
                    }
                }, 10000);
                this.pendings[id] = async data => {
                    const { dataset, datasetSource, warning } =
                        data as DslTransformResponse;
                    if (warning)
                        setBlockDataWarning(blockWithServices, warning);
                    if (datasetSource) {
                        const { data, errors } = await parseCSV(datasetSource);
                        if (errors?.length)
                            setBlockDataWarning(
                                blockWithServices,
                                errors[0].message
                            );
                        resolve(data);
                    } else resolve(dataset);
                };
            });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createBlocks(options: CreateBlocksOptions): Promise<BlockDefinition[]> {
        return new Promise<BlockDefinition[]>(resolve => {
            const { id } = this.post("blocks");
            setTimeout(() => {
                if (this.pendings[id]) {
                    delete this.pendings[id];
                    console.warn(
                        `iframedsl ${this.id}: no blocks returned, giving up`
                    );
                    resolve(this.blocks);
                }
            }, 3000);
            this.pendings[id] = data => {
                const bdata = data as DslBlocksResponse;
                this.blocks = bdata.blocks;
                this.category = bdata.category;
                console.debug(
                    `iframedsl ${this.id}: loaded ${this.blocks?.length} blocks, ${this.category?.length} categories`
                );
                const transformData = this.createTransformData();
                this.blocks.forEach(
                    block => (block.transformData = transformData)
                );
                resolve(this.blocks);
            };
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createCategory(options: CreateCategoryOptions): ContentDefinition[] {
        return this.category;
    }

    onWorkspaceJSONChange(json: WorkspaceJSON) {
        this.post("workspace", {
            workspace: json,
        });
    }

    onSave(file: WorkspaceFile) {
        this.post("save", file);
    }
}

/**
 * Creates an iframe DSL if applicable
 * @param targetOrigin
 * @returns
 */
export function createIFrameDSL(
    id: string,
    targetOrigin = "*"
): BlockDomainSpecificLanguage {
    return (
        inIFrame() &&
        new IFrameDomainSpecificLanguage(id, payload =>
            window.parent.postMessage(payload, targetOrigin)
        )
    );
}

/**
 * Creates an vscode DSL if applicable
 * @param targetOrigin
 * @returns
 */
export function createVSCodeDSL(id: string): BlockDomainSpecificLanguage {
    const acquireVsCodeApi: any = (window as any).acquireVsCodeApi;
    if (typeof acquireVsCodeApi === "function") {
        const vscode = acquireVsCodeApi();
        return new IFrameDomainSpecificLanguage(id, payload =>
            vscode.postMessage(payload)
        );
    }
    return undefined;
}

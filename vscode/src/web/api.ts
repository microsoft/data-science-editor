import { blocks, category, transforms, setCurrentWorkspace } from "./blocks";
import * as vscode from "vscode";
import { Utils } from "vscode-uri";

interface DataScienceEditorPostPayload {
    type?: "dsl";
    action?: string;
    dslid?: string;
    options?: { table: [string, string][] };
    editor?: string;
    xml?: string;
    json?: object;
}

export async function bindApi(view: vscode.WebviewPanel) {
    function post(payload: DataScienceEditorPostPayload) {
        console.debug(`data blocks send`, payload);
        view.webview.postMessage({ ...payload, from: "vscode" });
    }

    async function postFiles(currentDslId: string) {
        const files = await vscode.workspace.findFiles(
            "**/*.csv",
            "node_modules/*",
            100
        );
        const table: [string, string][] = files.map(file => [
            Utils.basename(file),
            file.path,
        ]);

        post({
            type: "dsl",
            dslid: currentDslId,
            action: "options",
            options: {
                table,
            },
        });
    }

    async function handleBlocks(data: any) {
        console.debug(`hostdsl: sending blocks`);
        post({ ...data, blocks, category });
    }

    async function handleTransform(data: any) {
        const { blockId, workspace, dataset, ...rest } = data;
        let result: object;
        const block = workspace.blocks.find((b: any) => b.id === blockId);
        if (!block) {
            console.error(`block ${blockId} not found in workspace`);
            result = { warning: "block lost" };
        } else {
            const transform = transforms[block.type];
            result = await transform(block, dataset);
        }
        post({ ...rest, ...(result || {}) });
    }

    const init = () => {
        // editor identifier sent by the embedded block editor
        let currentDslId: string | undefined;
        let loaded = false;
        let pendingLoad:
            | { editor: string; xml: string; json: object }
            | undefined;

        const tryLoading = async () => {
            if (!pendingLoad || !currentDslId) return;

            const { editor, xml, json } = pendingLoad;
            console.debug(`settings.sending`, { editor, xml, json });
            pendingLoad = undefined;
            await postFiles(currentDslId);
            post({
                type: "dsl",
                action: "load",
                editor,
                xml,
                json,
            });
        };

        view.webview.onDidReceiveMessage(
            (data: {
                // TODO: replace these types with the actual types
                type: string;
                dslid: string;
                action: string;
                workspace: string;
                editor: string;
                xml: string;
                json: string;
            }) => {
                if (data.type !== "dsl") {
                    return;
                }
                const { dslid, action } = data;
                console.debug(action, data);
                switch (action) {
                    case "mount": {
                        currentDslId = dslid;
                        console.debug(`dslid: ${dslid}`);
                        tryLoading();
                        break;
                    }
                    case "unmount": {
                        currentDslId = undefined;
                        break;
                    }
                    case "blocks": {
                        handleBlocks(data);
                        break;
                    }
                    case "transform": {
                        handleTransform(data);
                        break;
                    }
                    case "workspace": {
                        const { workspace } = data;
                        setCurrentWorkspace(workspace);
                        break;
                    }
                    case "save": {
                        // don't save until we've reloaded our content from excel
                        if (!loaded) {
                            console.debug(`save.ignore: not loaded yet`);
                            break;
                        }

                        const { editor, xml, json } = data;
                        const file = {
                            editor,
                            xml,
                            json,
                        };

                        // TODO0
                        //saveSetting(
                        //     SettingsKey.EditorSaveData,
                        //     JSON.stringify(file)
                        // );
                        break;
                    }
                    case "change": {
                        handleTransform(data);
                        break;
                    }
                }
            },
            false
        );

        tryLoading();
    };
    init();
}

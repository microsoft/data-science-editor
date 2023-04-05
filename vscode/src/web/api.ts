import { blocks, category, transforms, setCurrentWorkspace } from "./blocks";
import * as vscode from "vscode";
import { Utils } from "vscode-uri";

interface DataScienceEditorPostPayload {
    type?: "dsl";
    action?: string;
    dslid?: string;
    options?: { files: [string, string][] };
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
        const fileUris = await vscode.workspace.findFiles(
            "**/*.csv",
            "node_modules/*",
            100
        );
        const files: [string, string][] = fileUris.map(file => [
            Utils.basename(file),
            file.path,
        ]);

        post({
            type: "dsl",
            dslid: currentDslId,
            action: "options",
            options: {
                files,
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

    let currentFile: vscode.Uri | undefined;
    const loadFile = async (newFile: vscode.Uri) => {
        if (!currentFile) return;

        console.debug(`loading ${currentFile}`);
        let content:
            | { xml?: string; json?: object; editor?: string }
            | undefined;
        try {
            const buf = await vscode.workspace.fs.readFile(newFile);
            const text = new TextDecoder().decode(buf);
            content = JSON.parse(text);
        } catch (e) {
            content = {};
        }
        currentFile = newFile;
        post({
            type: "dsl",
            action: "load",
            ...content,
        });
    };

    const init = () => {
        // editor identifier sent by the embedded block editor
        let currentDslId: string | undefined;

        const tryLoading = async () => {
            if (!currentDslId) return;
            await loadFile(currentFile!);
            await postFiles(currentDslId);
        };

        view.webview.onDidReceiveMessage(
            async (data: {
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
                        currentFile = vscode.workspace.workspaceFolders?.[0]
                            ? Utils.joinPath(
                                  vscode.workspace.workspaceFolders[0].uri,
                                  "data.dse.json"
                              )
                            : undefined;
                        await tryLoading();
                        break;
                    }
                    case "unmount": {
                        currentDslId = undefined;
                        currentFile = undefined;
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
                        if (!currentFile) return;
                        const { editor, xml, json } = data;
                        const file = {
                            editor,
                            xml,
                            json,
                        };
                        await vscode.workspace.fs.writeFile(
                            currentFile,
                            new TextEncoder().encode(JSON.stringify(file))
                        );
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

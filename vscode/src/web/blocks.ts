import * as vscode from "vscode";
/* eslint-disable curly */
const colour = "#107C41";

export let currentWorkspace: unknown;

export const blocks = [
    {
        kind: "block",
        type: "vscode_import_csv",
        message0: "workspace csv file %1",
        tooltip: "Loads data from a CSV/TSV file in the workspace",
        colour,
        args0: [
            {
                type: "ds_field_iframe_data_chooser",
                name: "file",
                dataId: "files",
            },
        ],
        nextStatement: "DataScienceStatement",
        dataPreviewField: true,
        template: "meta",
    },
];

export const category = [
    {
        kind: "category",
        name: "Workspace",
        colour,
        contents: blocks.map(block => ({ kind: "block", type: block.type })),
        order: 100,
    },
];

function transformHeader(h: string) {
    return h
        .trim()
        .replace(/[.]/g, "")
        .replace(/(-|_)/g, " ")
        .toLocaleLowerCase();
}

export const transforms: Record<
    string,
    (
        b: any,
        dataset: any
    ) => Promise<{ warning?: string; dataset?: any; datasetSource?: string }>
> = {
    // don't rename these identifiers, they are used in the serialized blocky and will break existing files
    // eslint-disable-next-line @typescript-eslint/naming-convention
    vscode_import_csv: async b => {
        const fileName = b.inputs[0].fields["file"].value;
        if (!fileName) {
            console.debug(`no file selected`);
            return { dataset: [] };
        }
        let error: string | undefined;
        try {
            const buf = await vscode.workspace.fs.readFile(
                vscode.Uri.file(fileName)
            );
            const datasetSource = new TextDecoder().decode(buf);
            return {
                datasetSource,
            };
        } catch (e: any) {
            error = e.message;
        }
        const dataset: any = [];
        if (!dataset)
            return { warning: error || "file not found", dataset: [] };
        return { dataset };
    },
};

export const setCurrentWorkspace = (workspace: any) => {
    currentWorkspace = workspace;
};

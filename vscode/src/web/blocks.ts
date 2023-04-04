/* eslint-disable curly */
const colour = "#107C41";

export let currentWorkspace: unknown;

export const blocks = [
    {
        kind: "block",
        type: "vscode_import_csv",
        message0: "csv file %1",
        colour,
        args0: [
            {
                type: "ds_field_iframe_data_chooser",
                name: "file name",
                dataId: "table",
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
        name: "CSV Files",
        colour,
        contents: blocks.map(block => ({ kind: "block", type: block.type })),
        order: 100,
    },
];

export const transforms: Record<
    string,
    (b: any, dataset: any) => Promise<{ warning?: string; dataset: any }>
> = {
    // don't rename these identifiers, they are used in the serialized blocky and will break existing files
    // eslint-disable-next-line @typescript-eslint/naming-convention
    vscode_import_csv: async b => {
        const fileName = b.inputs[0].fields["file name"].value;
        if (!fileName) {
            console.debug(`table.load no table selected`);
            return { dataset: [] };
        }

        const dataset: any = [];
        if (!dataset) return { warning: "file not found", dataset: [] };
        return { dataset };
    },
};

export const setCurrentWorkspace = (workspace: any) => {
    currentWorkspace = workspace;
};

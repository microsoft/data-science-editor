/* eslint-disable @typescript-eslint/ban-types */
import { Workspace, alert } from "blockly"
import BuiltinDataSetField from "../fields/BuiltinDataSetField"
import {
    BlockDefinition,
    BlockReference,
    ButtonDefinition,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    identityTransformData,
    TextInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import {
    resolveWorkspaceServices,
    setBlockDataWarning,
} from "../WorkspaceContext"
import FileSaveField from "../fields/FileSaveField"
import { downloadCSV, saveCSV } from "./workers/csv.proxy"
import FileOpenField from "../fields/FileOpenField"
import palette from "./palette"
import { importCSVFilesIntoWorkspace } from "../../fs/fs"

const DATA_DATASET_BUILTIN_BLOCK = "data_dataset_builtin"
const DATA_ADD_DATASET_CALLBACK = "data_add_dataset_variable"
const DATA_LOAD_URL_BLOCK = "data_load_url"
const DATA_LOAD_FILE_BLOCK = "data_load_file"
const DATA_SAVE_FILE_BLOCK = "data_save_file"

// https://support.code.org/hc/en-us/articles/5257673491469-Submit-Datasets-for-Data-Science-
// spec: https://www.datascience4everyone.org/_files/ugd/d2c47c_db9901e7a3b04350b561457bea71b48e.pdf

function googleSheetUrl(id: string, sheet = "Sheet1") {
    let url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`
    if (sheet) url += `&sheet=${sheet}`
    return url
}
function patchCsvUrl(url: string) {
    const good =
        /https:\/\/docs.google.com\/spreadsheets\/d\/(?<id>[^/]+)\//i.exec(url)
    if (good) return googleSheetUrl(good.groups.id)

    return url
}

const [datasetColour] = palette()
const dataSetDsl: BlockDomainSpecificLanguage = {
    id: "dataSets",
    createBlocks: () => [
        <BlockDefinition>{
            kind: "block",
            type: DATA_DATASET_BUILTIN_BLOCK,
            message0: "dataset %1",
            tooltip: "Loads a builtin dataset",
            args0: [
                {
                    type: BuiltinDataSetField.KEY,
                    name: "dataset",
                },
            ],
            inputsInline: false,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: datasetColour,
            dataPreviewField: true,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: DATA_LOAD_URL_BLOCK,
            message0: "load dataset from url %1",
            tooltip:
                "Loads a CSV data from an external internal URL. If the URL is a Google Sheet, it will automatically be converted to CSV.",
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "url",
                    spellcheck: false,
                },
            ],
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: datasetColour,
            inputsInline: false,
            dataPreviewField: true,
            transformData: async block => {
                const url = block.getFieldValue("url") as string
                if (!url) return []

                const patched = patchCsvUrl(url)
                const { data, errors } = await downloadCSV(patched)
                if (errors?.length) {
                    setBlockDataWarning(block, errors[0].message)
                    console.debug(`csv download error`, {
                        errors,
                        url,
                        patched,
                    })
                }
                return data
            },
        },
        {
            kind: "block",
            type: DATA_LOAD_FILE_BLOCK,
            message0: "load dataset from file %1",
            tooltip:
                "Loads a local CSV file (enabled after opening local directory)",
            args0: [
                {
                    type: FileOpenField.KEY,
                    name: "file",
                },
            ],
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: datasetColour,
            inputsInline: false,
            dataPreviewField: true,
            transformData: identityTransformData,
        },
        {
            kind: "block",
            type: DATA_SAVE_FILE_BLOCK,
            message0: "save dataset to file %1",
            tooltip:
                "Saves the current data to a local CSV file (enabled after opening local directory)",
            args0: [
                {
                    type: FileSaveField.KEY,
                    name: "file",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: datasetColour,
            inputsInline: false,
            dataPreviewField: "after",
            transformData: async (block, data) => {
                const file = block.getField("file") as FileSaveField
                if (file?.fileHandle && data)
                    await saveCSV(file.fileHandle, data)
                return data
            },
        },
    ],
    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Data sets",
            colour: datasetColour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: DATA_DATASET_BUILTIN_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_LOAD_URL_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_LOAD_FILE_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: DATA_SAVE_FILE_BLOCK,
                },
                <ButtonDefinition>{
                    kind: "button",
                    text: "Import dataset to file",
                    callbackKey: DATA_ADD_DATASET_CALLBACK,
                    callback: async (workspace: Workspace) => {
                        const services = resolveWorkspaceServices(workspace)
                        const directory = services?.workingDirectory
                        if (!directory)
                            alert(
                                "You need to open a directory to import a dataset."
                            )
                        else {
                            const imported = await importCSVFilesIntoWorkspace(
                                directory.handle
                            )
                            if (imported > 0) {
                                await directory.sync()
                                alert("Datasets imported!")
                            }
                        }
                    },
                },
            ],
        },
    ],
}
export default dataSetDsl

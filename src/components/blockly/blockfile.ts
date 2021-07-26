import { WorkspaceJSON } from "../../../jacdac-ts/src/dsl/workspacejson";

export default interface BlockFile {
    editor: string
    xml: string
    json: WorkspaceJSON
}

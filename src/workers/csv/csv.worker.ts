/* eslint-disable @typescript-eslint/ban-types */
import Papa from "papaparse";
import { parse as json5Parse } from "json5";

export interface CsvMessage {
    worker: "csv";
    id?: string;
    type: string;
}

export interface CsvRequest extends CsvMessage {
    type: string;
}

export interface CsvDownloadRequest extends CsvRequest {
    url: string;
    type: "download";
}

export interface CsvFileRequest extends CsvRequest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fileHandle: any /* FileSystemFileHandle */;
}

export interface CsvSaveRequest extends CsvFileRequest {
    type: "save";
    data: object[];
}

export interface CsvUnparseRequest extends CsvRequest {
    type: "unparse";
    data: object[];
}

export interface CsvUnparseResponse extends CsvMessage {
    text: string;
}

export interface CsvParseRequest extends CsvRequest {
    type: "parse";
    source: string;
}

export interface CsvFile {
    url: string;
    data?: object[];
    errors?: {
        type: string; // A generalization of the error
        code: string; // Standardized error code
        message: string; // Human-readable details
        row: number; // Row index of parsed data where error is
    }[];
}

export interface CsvFileResponse extends CsvMessage {
    file: CsvFile;
}

function transformHeader(h: string) {
    return h
        .trim()
        .replace(/[.]/g, "")
        .replace(/(-|_)/g, " ")
        .toLocaleLowerCase();
}

// https://support.code.org/hc/en-us/articles/5257673491469-Submit-Datasets-for-Data-Science-
// spec: https://www.datascience4everyone.org/_files/ugd/d2c47c_db9901e7a3b04350b561457bea71b48e.pdf

function googleSheetUrl(id: string, sheet = "Sheet1") {
    let url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;
    if (sheet) url += `&sheet=${sheet}`;
    return url;
}
function patchCsvUrl(url: string) {
    const good =
        /https:\/\/docs.google.com\/spreadsheets\/d\/(?<id>[^/]+)\//i.exec(url);
    if (good) return googleSheetUrl(good.groups.id);

    return url;
}

async function tryParseJson(source: string): Promise<{ file: CsvFile }> {
    try {
        const data = json5Parse(source);
        if (data && Array.isArray(data) && typeof data[0] === "object")
            return { file: { data } as CsvFile };
        else
            return {
                file: {
                    errors: [
                        {
                            type: "json",
                            code: "invalid",
                            message: "Invalid JSON",
                            row: 0,
                        },
                    ],
                } as CsvFile,
            };
    } catch (e) {
        return undefined;
    }
}

const cachedCSVs: { [index: string]: { file: CsvFile } } = {};
const handlers: { [index: string]: (msg: CsvRequest) => Promise<object> } = {
    download: async (msg: CsvDownloadRequest) => {
        const url = patchCsvUrl(msg.url);
        if (cachedCSVs[url]) return Promise.resolve(cachedCSVs[url]);
        try {
            const resp = await fetch(url);
            const source = await resp.text();
            const res = (await handlers.parse({
                type: "parse",
                source,
            } as CsvParseRequest)) as { file: CsvFile };
            cachedCSVs[url] = res;
            return res;
        } catch (e) {
            return {
                file: {
                    errors: [
                        {
                            type: "json",
                            code: "invalid",
                            message: e + "",
                            row: 0,
                        },
                    ],
                } as CsvFile,
            };
        }
    },
    save: async (msg: CsvSaveRequest) => {
        const { fileHandle, data } = msg;

        // convert to CSV
        const contents = Papa.unparse(data);
        // Create a FileSystemWritableFileStream to write to.
        const writable = await fileHandle.createWritable();
        // Write the contents of the file to the stream.
        await writable.write(contents);
        // Close the file and write the contents to disk.
        await writable.close();

        return {};
    },
    parse: async (msg: CsvParseRequest) => {
        const { source } = msg;

        if (/\s*\[/.test(source)) {
            const res = await tryParseJson(source);
            if (res) return res;
        }

        return new Promise<{ file: CsvFile }>(resolve => {
            Papa.parse(source, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                comments: "#",
                transformHeader,
                complete: (r: CsvFile) => {
                    resolve({ file: r });
                },
            });
        });
    },
    unparse: async (msg: CsvUnparseRequest) => {
        const { data } = msg;
        const text = Papa.unparse(data);
        return { text };
    },
};

async function handleMessage(event: MessageEvent) {
    const message: CsvRequest = event.data;
    const { id, worker, type } = message;
    if (worker !== "csv") return;

    try {
        const handler = handlers[type];
        const resp = await handler(message);
        self.postMessage({
            id,
            worker,
            ...resp,
        });
    } catch (e) {
        self.postMessage({
            id,
            worker,
            error: e + "",
        });
    }
}

self.addEventListener("message", handleMessage);
console.debug(`csv: worker registered`);

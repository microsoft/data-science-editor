import { useMemo, useContext } from "react";
import { unique } from "../../../jacdac-ts/src/jdom/utils";
import { makeCodeServices } from "../../../jacdac-ts/src/jdom/makecode"
import useWindowEvent from "../hooks/useWindowEvent"
import MakeCodeSnippetContext from "./MakeCodeSnippetContext";

export interface MakeCodeSnippetSource {
    code: string;
    ghost?: string;
    meta: {
        editor?: string;
        snippet?: boolean;
        dependencies: string[];
    }
}

export interface MakeCodeSnippetRendered {
    uri?: string;
    width?: number;
    height?: number;
    error?: string;
}



export function parseMakeCodeSnippet(source: string): MakeCodeSnippetSource {
    let ghost: string;
    let code: string;
    const meta: {
        editor?: string;
        snippet?: boolean;
        dependencies: string[];
    } = {
        dependencies: []
    }

    if (/^---\n/.test(source)) {
        let front: string;
        const parts = source.replace(/^---\n/, '').split(/---\n/gm)
        switch (parts.length) {
            case 1: front = ghost = undefined; code = source; break;
            case 2: [front, code] = parts; break;
            default: [front, ghost, code] = parts; break;
        }

        // parse front matter
        front?.replace(/(.+):\s*(.+)\s*\n/g, (m, name, value) => {
            switch (name) {
                case "dep": meta.dependencies.push(value); break;
                case "snippet": meta.snippet = !!value; break;
                default: meta[name] = value;
            }
            return "";
        })
    } else {
        code = source;
    }

    // sniff services
    const mkcds = makeCodeServices()
    mkcds.filter(info => {
        const src = (ghost || "") + "\n" + (code || "");
        return src.indexOf(info.client.qName) > -1
            || (info.client.default && src.indexOf(info.client.default) > -1);
    }).map(info => `${info.client.name.replace(/^pxt-/, '')}=github:${info.client.repo}`)
        .forEach(dep => meta.dependencies.push(dep));

    // add jacdac by default
    if (!meta.dependencies.length)
        meta.dependencies.push("jacdac=github:microsoft/pxt-jacdac");

    // ensure unique deps
    meta.dependencies = unique(meta.dependencies);

    return {
        code,
        ghost,
        meta
    }
}

interface RenderBlocksRequestMessage {
    type: "renderblocks",
    id: string;
    code: string;
    ghost?: string;
    options?: {
        packageId?: string;
        package?: string;
        snippetMode?: boolean;
        dependencies?: string[];
    }
}

interface RenderBlocksResponseMessage {
    source: "makecode",
    type: "renderblocks",
    id: string;
    uri?: string;
    css?: string;
    svg?: string;
    width?: number;
    height?: number;
    error?: string;
}

interface RenderBlocksRequentResponse {
    req: RenderBlocksRequestMessage,
    resolve: (resp: RenderBlocksResponseMessage) => void,
    reject: (e: unknown) => void
}

export function useMakeCodeRenderer() {
    const { target, rendererUrl } = useContext(MakeCodeSnippetContext);
    const lang = ""
    const iframeId = "makecoderenderer" + target;
    const pendingRequests = useMemo<{
        [index: string]: RenderBlocksRequentResponse
    }>(() => ({}), [target, lang]);

    const sendRequest = (req: RenderBlocksRequestMessage) => {
        const iframe = typeof document !== "undefined" && document.getElementById(iframeId) as HTMLIFrameElement;
        if (iframe?.dataset.ready)
            iframe?.contentWindow.postMessage(req, rendererUrl);
    }

    const render = (source: MakeCodeSnippetSource): Promise<MakeCodeSnippetRendered> => {
        const { code, ghost, meta } = source;
        const { dependencies, snippet } = meta;

        // spin up iframe on demans
        if (typeof document !== "undefined" && !document.getElementById(iframeId)) {
            console.log(`mkcd: loading iframe`)
            const f = document.createElement("iframe");
            f.id = iframeId;
            f.style.position = "absolute";
            f.style.left = "0";
            f.style.bottom = "0";
            f.style.width = "1px";
            f.style.height = "1px";
            f.src = `${rendererUrl}?render=1${lang ? `&lang=${lang}` : ''}`;
            document.body.appendChild(f);
        }

        const req: RenderBlocksRequestMessage = {
            type: "renderblocks",
            id: "r" + Math.random(),
            code,
            ghost,
            options: {
                dependencies,
                snippetMode: snippet
            }
        }
        return new Promise<RenderBlocksResponseMessage>((resolve, reject) => {
            pendingRequests[req.id] = { req, resolve, reject }
            sendRequest(req);
        })
    }

    // listen for messages
    const handleMessage = (ev: MessageEvent) => {
        const msg = ev.data;
        if (msg.source != "makecode") return;
        switch (msg.type) {
            case "renderready": {
                console.log(`mkcd: renderer ready, ${Object.keys(pendingRequests).length} pending`)
                const iframe = typeof document !== "undefined" && document.getElementById(iframeId)
                if (iframe) {
                    console.log(`flushing messages`)
                    iframe.dataset.ready = "1"
                    Object.keys(pendingRequests)
                        .forEach(k => sendRequest(pendingRequests[k].req));
                }
                break;
            }
            case "renderblocks": {
                const id = msg.id; // this is the id you sent
                const r = pendingRequests[id];
                if (!r) return;
                delete pendingRequests[id];
                r.resolve(msg as RenderBlocksResponseMessage);
                break;
            }
        }
    }

    useWindowEvent("message", handleMessage, false, [])

    return {
        render
    }
}

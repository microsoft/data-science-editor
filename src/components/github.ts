import { useMemo } from "react"
import { semverCmp } from "./semver"
import useFetch from "./useFetch"

const ROOT = "https://api.github.com/"
export const GITHUB_API_KEY = "githubtoken"

interface GithubContent {
    name: string
    sha: string
    size: number
    html_url: string
    download_url: string
    type: "file" | "dir" | "symlink"
}

export interface GithubFirmwareRelease {
    version: string
    sha: string
    size: number
    html_url: string
    download_url: string
}

export interface GithubUser {
    login: string
    avatar_url: string
    html_url: string
}

export interface GithubRepository {
    name: string
    full_name: string
    private: boolean
    owner: GithubUser
    description: string
    fork: boolean
    homepage: string
    default_branch: string
    organization: GithubUser
    html_url: string
}

function contentToFirmwareRelease(
    content: GithubContent
): GithubFirmwareRelease {
    // filter out non-file, non-uf2
    const version =
        content?.type === "file" &&
        /^fw-(\d+\.\d+.\d+)\.uf2$/.exec(content.name)?.[1]
    if (!version) return undefined

    return {
        version,
        sha: content.sha,
        size: content.size,
        html_url: content.html_url,
        download_url: content.download_url,
    }
}

function contentsToFirmwareReleases(contents: GithubContent[]) {
    return contents
        ?.map(contentToFirmwareRelease)
        .filter(r => !!r)
        .sort((l, r) => -semverCmp(l.version, r.version))
}

export function normalizeSlug(slug: string) {
    if (!slug) return {}
    const cleaned = slug.replace(/^https:\/\/github.com\//, "")
    const parts = cleaned.split("/")
    return {
        repoPath: `${parts[0]}/${parts[1]}`,
        folder: parts.slice(2).join("/"),
    }
}

export interface GitHubApiOptions {
    ignoreThrottled?: boolean
}

export function parseRepoUrl(url: string): { owner: string; name: string } {
    const m = /^https:\/\/github\.com\/([^/ \t]+)\/([^/ \t]+)\/?$/.exec(
        url || ""
    )
    if (m) return { owner: m[1], name: m[2] }
    return undefined
}

export async function fetchLatestRelease(
    slug: string,
    options?: GitHubApiOptions
): Promise<{
    status: number
    release?: GithubFirmwareRelease
}> {
    // https://api.github.com/repos/microsoft/jacdac-msr-modules/contents/dist
    const { repoPath } = normalizeSlug(slug)
    const uri = `${ROOT}repos/${repoPath}/contents/dist`
    const resp = await fetch(uri)
    //    console.log(resp)
    const { status } = resp
    switch (status) {
        case 200:
        case 204: {
            const contents: GithubContent[] = await resp.json()
            const releases = contentsToFirmwareReleases(contents)
            return { release: releases[0], status }
        }
        case 404:
            // unknow repo or no access
            return { status }
        case 403:
            // throttled
            if (options?.ignoreThrottled) return { status }
            throw new Error("Too many calls to GitHub, try again later")
    }
    throw new Error(`unknown status code ${resp.status}`)
}

export async function fetchReleaseBinary(
    slug: string,
    version: string
): Promise<Blob> {
    // we are not using the release api because of CORS.
    const { repoPath } = normalizeSlug(slug)
    const downloadUrl = `https://raw.githubusercontent.com/${repoPath}/main/dist/fw-${version}.uf2`
    const req = await fetch(downloadUrl, {
        headers: { Accept: "application/octet-stream" },
    })
    if (req.status == 200) {
        const firmware = await req.blob()
        return firmware
    }
    return undefined
}

export async function fetchText(
    slug: string,
    tag: string,
    path: string,
    mimeType: string
) {
    const { repoPath, folder } = normalizeSlug(slug)
    const downloadUrl = `https://raw.githubusercontent.com/${repoPath}/${tag}/${
        folder ? `${folder}/` : ""
    }${path}`
    const req = await fetch(downloadUrl, {
        headers: { Accept: mimeType },
    })
    if (req.status == 200) {
        const src = await req.text()
        return src
    }
    return undefined
}

function useFetchApi<T>(path: string, options?: GitHubApiOptions) {
    const res = useFetch<T>(path ? `${ROOT}${path}` : undefined)
    if (res.status !== undefined)
        switch (res.status) {
            case 200:
            case 201:
            case 202:
            case 203:
            case 204:
                break
            case 404:
                // unknow repo or no access
                res.response = undefined
                break
            case 403:
                // throttled
                if (options?.ignoreThrottled) {
                    res.response = undefined
                    return res
                } else
                    throw new Error("Too many calls to GitHub, try again later")

            default:
                console.log(`unknown status`, res)
                throw new Error(`Unknown response from GitHub ${res.status}`)
        }
    return res
}

export function useFetchJSON<T>(
    slug: string,
    tag: string,
    path: string,
    mimeType: "text/plain" | "application/json"
) {
    const { repoPath, folder } = normalizeSlug(slug)
    const downloadUrl = `https://raw.githubusercontent.com/${repoPath}/${tag}/${
        folder ? `${folder}/` : ""
    }${path}`
    return useFetch<T>(downloadUrl, {
        headers: { Accept: mimeType },
    })
}

export function useRepository(slug: string) {
    const { repoPath } = normalizeSlug(slug)
    const path = repoPath ? `repos/${repoPath}` : undefined
    const res = useFetchApi<GithubRepository>(path, { ignoreThrottled: true })
    return res
}

export function useLatestRelease(slug: string, options?: GitHubApiOptions) {
    const resp = useLatestReleases(slug, options)
    return {
        ...resp,
        response: resp.response?.[0],
    }
}

export function useLatestReleases(slug: string, options?: GitHubApiOptions) {
    if (!slug)
        return {
            response: undefined,
            loading: false,
            error: undefined,
            status: undefined,
        }
    const { repoPath } = normalizeSlug(slug)
    const uri = `repos/${repoPath}/contents/dist`
    const res = useFetchApi<GithubContent[]>(uri, {
        ...(options || {}),
        ignoreThrottled: true,
    })
    return {
        ...res,
        response: contentsToFirmwareReleases(res.response),
    }
}

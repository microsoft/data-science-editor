import useFetch from "./useFetch"

const ROOT = "https://api.github.com/"
export const GITHUB_API_KEY = "githubtoken"
export interface GithubRelease {
    url: string
    html_url: string
    tag_name: string
    name: string
    body: string
    assets: {
        url: string
        browser_download_url: string
        name: string
    }[]
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

export function normalizeSlug(slug: string): string {
    return slug.replace(/^https:\/\/github.com\//, "")
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
): Promise<GithubRelease> {
    const uri = `${ROOT}repos/${normalizeSlug(slug)}/releases/latest`
    const resp = await fetch(uri)
    //    console.log(resp)
    switch (resp.status) {
        case 200:
        case 204: {
            const release: GithubRelease = await resp.json()
            return release
        }
        case 404:
            // unknow repo or no access
            return undefined
        case 403:
            // throttled
            if (options?.ignoreThrottled) return undefined
            throw new Error("Too many calls to GitHub, try again later")
    }
    throw new Error(`unknown status code ${resp.status}`)
}

export async function fetchReleaseBinary(
    slug: string,
    tag: string
): Promise<Blob> {
    // we are not using the release api because of CORS.
    const downloadUrl = `https://raw.githubusercontent.com/${normalizeSlug(
        slug
    )}/${tag}/dist/firmware.uf2`
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
    const downloadUrl = `https://raw.githubusercontent.com/${normalizeSlug(
        slug
    )}/${tag}/${path}`
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
    const res = useFetch<T>(`${ROOT}${path}`)
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

export function useRepository(slug: string) {
    const path = `repos/${normalizeSlug(slug)}`
    const res = useFetchApi<GithubRepository>(path, { ignoreThrottled: true })
    return res
}

export function useLatestRelease(slug: string, options?: GitHubApiOptions) {
    if (!slug)
        return {
            response: undefined,
            loading: false,
            error: undefined,
            status: undefined,
        }
    const uri = `repos/${normalizeSlug(slug)}/releases/latest`
    const res = useFetchApi<GithubRelease>(uri, {
        ...(options || {}),
        ignoreThrottled: true,
    })
    return res
}

export function useLatestReleases(slug: string, options?: GitHubApiOptions) {
    if (!slug)
        return {
            response: undefined,
            loading: false,
            error: undefined,
            status: undefined,
        }
    const uri = `repos/${normalizeSlug(slug)}/releases`
    const res = useFetchApi<GithubRelease[]>(uri, {
        ...(options || {}),
        ignoreThrottled: true,
    })
    return res
}

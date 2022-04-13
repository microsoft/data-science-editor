import { Link } from "gatsby-theme-material-ui"
import React from "react"
import GithubRepositoryList from "../components/github/GithubRespositoryList"

export default function Page() {
    return (
        <>
            <h1>GitHub Repositories</h1>
            <p>
                Jacdac is Open Source on GitHub. Here is a map to help you find
                the part you want:
            </p>
            <h2>Discussions</h2>
            <p>
                Post your questions, bugs, suggestions on the centralized
                discussions at{" "}
                <a href="https://github.com/microsoft/jacdac/discussions">
                    https://github.com/microsoft/jacdac/discussions
                </a>
                .
            </p>
            <h2>Specification and Schematics</h2>
            <GithubRepositoryList
                repos={["microsoft/jacdac", "microsoft/jacdac-ddk"]}
                showDescription={true}
            />
            <h2>Module Development</h2>

            <h3>Server SDKs</h3>

            <GithubRepositoryList
                repos={[
                    "microsoft/jacdac-c",
                    "microsoft/jacdac-stm32x0",
                    "microsoft/jacdac-msr-modules",
                    "microsoft/jacdac-esp32",
                    "microsoft/jacdac-padauk",
                    "microsoft/jacdac-posix",
                ]}
                showDescription={true}
            />

            <h2>Client SDKs</h2>

            <GithubRepositoryList
                repos={[
                    "microsoft/jacdac-ts",
                    "microsoft/jacdac-dotnet",
                    "microsoft/jacdac-python",
                    "microsoft/pxt-jacdac",
                ]}
                showDescription={true}
            />

            <h2>Integrations</h2>

            <GithubRepositoryList
                repos={[
                    "microsoft/node-red-contrib-jacdac",
                    "microsoft/react-jacdac",
                    "microsoft/jacdac-cli",
                ]}
                showDescription={true}
            />

            <h2>Embedded Tools</h2>

            <GithubRepositoryList
                repos={[
                    "microsoft/pxt-jacdac/tools/multitool",
                    "microsoft/pxt-jacdac/tools/hid-events",
                    "microsoft/pxt-jacdac/devices/microbit",
                    "microsoft/pxt-jacdac/tools/microbit-oob",
                ]}
                showDescription={false}
            />

            <h2> Documentation</h2>

            <GithubRepositoryList
                repos={["microsoft/jacdac-docs"]}
                showDescription={true}
            />

            <h2>Experimental</h2>

            <GithubRepositoryList
                repos={[
                    "microsoft/jacdac-circuitpython",
                    "microsoft/jupyter-jacdac",
                ]}
                showDescription={true}
            />

            <h2> Microsoft Open Source Code of Conduct</h2>

            <p>
                This project is hosted at{" "}
                <Link href="https://github.com/microsoft/jacdac-docs">
                    https://github.com/microsoft/jacdac-docs
                </Link>
                . This project has adopted the{" "}
                <Link href="https://opensource.microsoft.com/codeofconduct/">
                    Microsoft Open Source Code of Conduct
                </Link>
                .
            </p>

            <h3>Resources</h3>
            <ul>
                <li>
                    <Link href="https://opensource.microsoft.com/codeofconduct/">
                        Microsoft Open Source Code of Conduct
                    </Link>
                </li>
                <li>
                    <Link href="https://opensource.microsoft.com/codeofconduct/faq/">
                        Microsoft Code of Conduct FAQ
                    </Link>
                </li>
                <li>
                    Contact{" "}
                    <Link href="mailto:opencode@microsoft.com">
                        opencode@microsoft.com
                    </Link>{" "}
                    with questions or concerns
                </li>
            </ul>
        </>
    )
}

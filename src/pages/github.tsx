import { Link } from "gatsby-theme-material-ui"
import React from "react"
import GithubRepositoryList from "../components/GithubRespositoryList"

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
            <h2>Specification</h2>
            <GithubRepositoryList
                repos={["microsoft/jacdac"]}
                showDescription={true}
            />
            <h2>Module Development</h2>

            <h3>Schematics and C SDK</h3>

            <GithubRepositoryList
                repos={["microsoft/jacdac-ddk", "microsoft/jacdac-c"]}
                showDescription={true}
            />

            <h3> Platforms</h3>

            <GithubRepositoryList
                repos={[
                    "microsoft/jacdac-stm32x0",
                    "microsoft/jacdac-esp32",
                    "microsoft/jacdac-padauk",
                ]}
                showDescription={true}
            />

            <h2>Embedded clients</h2>

            <GithubRepositoryList
                repos={[
                    "microsoft/pxt-jacdac",
                    "microsoft/jacdac-circuitpython",
                ]}
                showDescription={true}
            />

            <h2>Web libraries</h2>

            <GithubRepositoryList
                repos={["microsoft/jacdac-ts"]}
                showDescription={true}
            />

            <h2> Tools & Integrations</h2>

            <GithubRepositoryList
                repos={[
                    "microsoft/pxt-jacdac/tools/multitool",
                    "microsoft/node-red-contrib-jacdac",
                    "microsoft/jupyter-jacdac",
                ]}
                showDescription={true}
            />

            <h2> Documentation</h2>

            <GithubRepositoryList
                repos={["microsoft/jacdac-docs"]}
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

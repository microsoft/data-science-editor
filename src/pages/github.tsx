import { Link } from "gatsby-theme-material-ui"
import React from "react"
import PageLinkList from "../components/ui/PageLinkList"

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
            <h2>Videos on Youtube</h2>
            <p>
                The{" "}
                <a href="https://www.youtube.com/channel/UCDDeOurixeITal31eI4Ga2g">
                    Jacdac channel
                </a>{" "}
                hosts various videos on using Jacdac.
            </p>
            <h2>Specification and Schematics</h2>
            <PageLinkList
                dense
                nodes={[
                    {
                        title: "microsoft/jacdac",
                        description:
                            "Service specifications and device catalog",
                        href: "https://github.com/microsoft/jacdac",
                    },
                    {
                        title: "microsoft/jacdac-ddk",
                        description: "Device Development Kit",
                        href: "https://github.com/microsoft/jacdac-ddk",
                    },
                ]}
            />
            <h2>Module Development</h2>

            <h3>Server SDKs</h3>
            <PageLinkList
                dense
                nodes={[
                    {
                        title: "microsoft/jacdac-c",
                        description: "C Firmware library",
                        href: "https://github.com/microsoft/jacdac-c",
                    },
                    {
                        title: "microsoft/jacdac-stm32x0",
                        description: "Firmware library for STM32F0 and similar",
                        href: "https://github.com/microsoft/jacdac-stm32x0",
                    },
                    {
                        title: "microsoft/jacdac-msr-modules",
                        description:
                            "Firmware for prototype Jacdac modules made by Microsoft Research",
                        href: "https://github.com/microsoft/jacdac-msr-modules",
                    },
                    {
                        title: "microsoft/jacdac-module-template",
                        description:
                            "Template repository for firmware for a STM32G0-based Jacdac module",
                        href: "https://github.com/microsoft/jacdac-module-template",
                    },
                    {
                        title: "microsoft/jacdac-esp32",
                        description: "Firmware library for ESP32 IDF",
                        href: "https://github.com/microsoft/jacdac-esp32",
                    },
                    {
                        title: "microsoft/jacdac-padauk",
                        description: "Firmware library for PADAUK",
                        href: "https://github.com/microsoft/jacdac-padauk",
                    },
                    {
                        title: "microsoft/jacdac-posix",
                        description:
                            "Firmware library for native Jacdac on desktop",
                        href: "https://github.com/microsoft/jacdac-posix",
                    },
                    {
                        title: "microsoft/codal-jacdac",
                        description: "Jacdac-C SDK integration for CODAL",
                        href: "https://github.com/microsoft/codal-jacdac",
                    },
                ]}
            />

            <h2>Client SDKs</h2>

            <PageLinkList
                dense
                nodes={[
                    {
                        title: "microsoft/jacdac-ts",
                        description: "TypeScript/JavaScript library",
                        href: "https://github.com/microsoft/jacdac-ts",
                    },
                    {
                        title: "microsoft/jacdac-dotnet",
                        description: ".NET (desktop, nano, tiny) library",
                        href: "https://github.com/microsoft/jacdac-dotnet",
                    },
                    {
                        title: "microsoft/jacdac-python",
                        description: "Python (desktop) library",
                        href: "https://github.com/microsoft/jacdac-python",
                    },
                    {
                        title: "microsoft/pxt-jacdac",
                        description: "MakeCode library",
                        href: "https://github.com/microsoft/pxt-jacdac",
                    },
                ]}
            />

            <h2>Integrations</h2>

            <PageLinkList
                dense
                nodes={[
                    {
                        title: "microsoft/jacdac-docs",
                        description: "Documentation, web tools and dashboard",
                        href: "https://github.com/microsoft/jacdac-docs",
                    },
                    {
                        title: "microsoft/jacdac-cli",
                        description: "Command line interface",
                        href: "https://github.com/microsoft/jacdac-cli",
                    },
                    {
                        title: "microsoft/react-jacdac",
                        description: "React library",
                        href: "https://github.com/microsoft/react-jacdac",
                    },
                    {
                        title: "microsoft/node-red-contrib-jacdac",
                        description: "node-red-contrib-jacdac",
                        href: "https://github.com/microsoft/node-red-contrib-jacdac",
                    },
                ]}
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

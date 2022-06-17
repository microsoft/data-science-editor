import React, { useEffect, useMemo, useState } from "react"
import { styled } from "@mui/material/styles"
import { List, Collapse } from "@mui/material"
import { ListItemButton } from "gatsby-theme-material-ui"
// tslint:disable-next-line: no-submodule-imports
import ListItemText from "@mui/material/ListItemText"
import { graphql, useStaticQuery } from "gatsby"
import ExpandMore from "@mui/icons-material/ExpandMore"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
const PREFIX = "Toc"

const classes = {
    root: `${PREFIX}root`,
}

const StyledList = styled(List)(({ theme }) => ({
    [`&.${classes.root}`]: {
        width: "100%",
        backgroundColor: theme.palette.background.paper,
    },
}))

interface TocNode {
    name: string
    path: string
    order: number
    children?: TocNode[]
}

function treeifyToc(toc: TocNode[]) {
    let tree = toc.slice(0)

    // reconstruct tree
    const tocNodes: { [index: string]: TocNode } = {}
    tree.forEach((node, index) => {
        const k = node.path.replace(/\/$/, "")
        if (tocNodes[k]) {
            tree[index] = undefined
        } else tocNodes[k] = node
    })
    tree = tree.filter(node => !!node)
    tree.forEach((node, index) => {
        const parts = node.path.replace(/\/$/, "").split("/")
        parts.pop()
        while (parts.length) {
            const parentPath = `${parts.join("/")}`
            const parent = tocNodes[parentPath]
            if (parent) {
                if (!parent.children) parent.children = []
                parent.children.push(node)
                tree[index] = undefined
                break
            }
            parts.pop()
        }
    })
    const r = {
        tree: tree.filter(node => !!node),
        nodes: tocNodes,
    }

    function sortNodes(nodes: TocNode[]) {
        nodes.sort((l, r) => l.order - r.order || l.name.localeCompare(r.name))
        nodes.forEach(node => node.children && sortNodes(node.children))
    }
    sortNodes(r.tree)

    return r
}

function TocListItem(props: {
    pagePath: string
    entry: TocNode
    level: number
}) {
    const { pagePath, entry, level } = props
    const { path, children, name } = entry
    const selected = pagePath === path
    const [expanded, setExpanded] = useState(pagePath.startsWith(path))
    const hasChildren = !!children?.length
    const sub = level === 1 || hasChildren
    const showSub = expanded && sub && hasChildren && pagePath.startsWith(path)

    const handleClick = () => {
        if (selected) setExpanded(v => !v)
    }

    useEffect(() => {
        if (selected) setExpanded(true)
    }, [selected])

    return (
        <>
            <ListItemButton
                to={path}
                onClick={handleClick}
                selected={selected}
                sx={{ width: "100%", pl: Math.max(1, level) }}
            >
                <ListItemText
                    primary={selected ? <b>{name}</b> : name}
                    color={selected ? "primary" : undefined}
                />
                {hasChildren &&
                    (showSub ? <ExpandMore /> : <ChevronRightIcon />)}
            </ListItemButton>
            <Collapse in={showSub} timeout="auto" unmountOnExit>
                <List dense className={classes.root}>
                    {children?.map(child => (
                        <TocListItem
                            key={child.path}
                            entry={child}
                            level={level + 1}
                            pagePath={pagePath}
                        />
                    ))}
                </List>
            </Collapse>
        </>
    )
}

export default function Toc(props: { pagePath: string }) {
    const { pagePath } = props

    const data = useStaticQuery(graphql`
        query {
            allMdx {
                edges {
                    node {
                        headings {
                            value
                        }
                        frontmatter {
                            title
                            order
                            hideToc
                        }
                        fields {
                            slug
                        }
                        parent {
                            ... on File {
                                sourceInstanceName
                            }
                        }
                    }
                }
            }
        }
    `)

    const tree = useMemo(() => {
        // convert pages into tree
        const toc: TocNode[] = [
            {
                name: "Getting Started",
                path: "/start/",
                order: 0.05,
            },
            {
                name: "Device Dashboard",
                path: "/dashboard/",
                order: 0.1,
            },
            {
                name: "Device Catalog",
                path: "/devices/",
                order: 0.2,
            },
            {
                name: "Client Programming",
                path: "/clients/",
                order: 0.4,
            },
            {
                name: "Service Catalog",
                path: "/services/",
                order: 0.5,
            },
            {
                name: "Web Tools",
                path: "/tools/",
                order: 0.6,
            },
            {
                name: "Device Development",
                path: "/ddk/",
                order: 0.8,
            },
            {
                name: "Specifications",
                path: "/reference/",
                order: 0.81,
            },
            {
                name: "FAQ",
                path: "/faq/",
                order: 0.85,
            },
            {
                name: "Blog",
                path: "/blog/",
                order: 0.88,
            },
        ]

        data.allMdx.edges
            .map(node => node.node)
            .filter(
                node => !!node.frontmatter?.title && node.fields.slug !== "/"
            )
            .filter(node => !node.frontmatter || !node.frontmatter?.hideToc)
            .map(node => {
                const r = {
                    name: node.frontmatter?.title || node.headings[0].value,
                    path: node.fields.slug,
                    order:
                        node.frontmatter?.order !== undefined
                            ? node.frontmatter?.order
                            : 50,
                }
                return r
            })
            .forEach(node => toc.push(node))
        const { tree } = treeifyToc(toc)
        return tree
    }, [])

    return (
        <StyledList dense className={classes.root}>
            {tree.map(entry => (
                // eslint-disable-next-line react/prop-types
                <TocListItem
                    key={entry.path}
                    entry={entry}
                    level={1}
                    pagePath={pagePath}
                />
            ))}
        </StyledList>
    )
}

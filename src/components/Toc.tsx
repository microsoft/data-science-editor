import React, { useContext, useMemo } from "react"
import {
    makeStyles,
    createStyles,
    Theme,
    List,
    ListItem,
    Typography,
    useTheme,
    Box,
} from "@material-ui/core"
import { Link } from "gatsby-theme-material-ui"
// tslint:disable-next-line: no-submodule-imports
import ListItemText from "@material-ui/core/ListItemText"
import AppContext, { DrawerType } from "./AppContext"
import { graphql, useStaticQuery } from "gatsby"

interface TocNode {
    name: string
    path: string
    order: number
    children?: TocNode[]
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
            backgroundColor: theme.palette.background.paper,
        },
    })
)

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
        nodes.sort((l, r) => l.order - r.order)
        nodes.forEach(node => node.children && sortNodes(node.children))
    }
    sortNodes(r.tree)

    return r
}

export default function Toc(props: { pagePath: string }) {
    const { pagePath } = props
    const { setDrawerType } = useContext(AppContext)
    const theme = useTheme()
    const classes = useStyles()

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
                        excerpt
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

    /*
      site {
        siteMetadata {
          title
        }
    }
  
    allServicesJson {
        nodes {
          name
          shortId
        }
      } 
    allDevicesJson {
        nodes {
          id
          name
        }
      }
   */

    const handleClick = () => {
        setDrawerType(DrawerType.None)
    }

    const tree = useMemo(() => {
        // convert pages into tree
        const toc: TocNode[] = [
            {
                name: "Home",
                path: "/",
                order: 0,
            },
            {
                name: "Dashboard",
                path: "/dashboard/",
                order: 0.5,
            },
            {
                name: "Protocol",
                path: "/protocol/",
                order: 0.55,
            },
            {
                name: "Hardware",
                path: "/hardware/",
                order: 0.6,
            },
            {
                name: "Software",
                path: "/software/",
                order: 0.6,
            },
            {
                name: "Tools",
                path: "/tools/",
                order: 0.7,
            },
            {
                name: "Reference",
                path: "/reference/",
                order: 0.8,
            },
            {
                name: "Services",
                path: "/services/",
                order: 0.9,
            },
            {
                name: "Devices",
                path: "/devices/",
                order: 0.95,
            },

            {
                name: "Clients",
                path: "/clients/",
                order: 5,
            },
        ]

        data.allMdx.edges
            .map(node => node.node)
            .filter(
                node =>
                    !!node.frontmatter?.title ||
                    (!!node.headings.length &&
                        !/404/.test(node.headings[0].value))
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

        /*
    data.allServicesJson.nodes.map(node => {
      return {
        name: node.name,
        path: `/services/${node.shortId}/`
      }
    }).forEach(node => toc.push(node))

    data.allDevicesJson.nodes.map(node => {
      return {
        name: node.name,
        path: `/devices/${identifierToUrlPath(node.id)}/`
      }
    }).forEach(node => toc.push(node));
    */

        const { tree } = treeifyToc(toc)
        return tree
    }, [])

    function TocListItem(props: { entry: TocNode; level: number }) {
        const { entry, level } = props
        const { path, children, name } = entry
        const selected = pagePath === path
        const sub = level === 1 || (!!children && !!children.length)

        return (
            <>
                <ListItem button selected={selected} key={"tocitem" + path}>
                    <Link
                        style={{ color: theme.palette.text.primary }}
                        onClick={handleClick}
                        to={path}
                    >
                        <ListItemText
                            primary={
                                <Typography
                                    variant={sub ? "button" : "caption"}
                                >
                                    {name}
                                </Typography>
                            }
                        />
                    </Link>
                </ListItem>
                {sub && !!children?.length && (
                    <Box ml={level > 0 ? 1 : 0}>
                        {children?.map(child => (
                            <TocListItem
                                key={"tocitem" + child.path}
                                entry={child}
                                level={level + 1}
                            />
                        ))}
                    </Box>
                )}
            </>
        )
    }

    return (
        <List dense className={classes.root}>
            {tree.map(entry => (
                <TocListItem key={entry.path} entry={entry} level={0} />
            ))}
        </List>
    )
}

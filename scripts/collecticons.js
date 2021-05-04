const glob = require("glob")
const fs = require("fs")

// options is optional
glob("src/**/*.tsx", {}, function (er, files) {
    console.log(`found ${files.length} files`)
    let icons = {}
    files.forEach(f => {
        const source = fs.readFileSync(f, "utf8")
        source.replace(
            /import (\w+) from "@material-ui\/icons\/(\w+)"/g,
            (m, cls, imp) => {
                icons[cls] = imp
            }
        )
    })

    let res = `
import React from "react"
${Object.keys(icons)
    .map(icon => `import ${icon} from "@material-ui/icons/${icons[icon]}"`)
    .join("\n")}

function IconGrid() {
    const icons = [${Object.keys(icons)
        .map(icon => `<${icon} />`)
        .join(", ")}]
    return <Grid container spacing={1}>
        {icons.map((icon, i) => (
            <Grid item key={i}>
                {icon}
            </Grid>
        ))}
    </Grid>
}
`
    console.log(res)
})

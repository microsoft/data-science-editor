# Data Science Editor

https://microsot.github.io/data-science-editor/videos/cereal-calories-sort.mp4

## Developer setup

-   Open this repository online at https://github.dev/microsoft/data-science-editor

All command line instructions assume a bash-like terminal.

On Windows, you may need to run these commands within Git Bash or Windows Subsystem for Linux (WSL), unless you have bash-like tools available locally. Previous installs have worked on WSL2 with Ubuntu-20.04.

### Codespaces

Edit this project directly from your browser using GitHub Codespaces. If you have access to them,

-   open project in a new codespace (https://github.dev/microsoft/data-science-editor)
-   launch the docs server

```
yarn develop
```

-   click on the generated URL in the terminal output and voila!

**Do not use npm**

#### Updating dependencies

Use [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) to upgrade all dependencies expect blockly*, tfjs, mdx.

### VS Code

You are welcome to use any editor you want! Visual Studio Code
provides seamless support for git sub-modules and is our preferred editor.

-   open [Visual Studio Code](https://code.visualstudio.com/)

```
code .
```

-   install the recommended extensions (**MDX**, **ESLint** and **Prettier** extensions)
-   remember that you need a bash-like terminal to run some of these commands - VS Code allows you to start a Git Bash terminal from the new terminals dropdown
-   run the docs web site locally

```
yarn develop
```

-   browse to the local server

```
http://localhost:8000?dbg=1
```

## Microsoft Open Source Code of Conduct

This project is hosted at https://github.com/microsoft/data-science-editor.
This project has adopted the
[Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).

Resources:

-   [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/)
-   [Microsoft Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/)
-   Contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with questions or concerns

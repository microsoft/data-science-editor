import * as vscode from "vscode";

class WebViewSerializer implements vscode.WebviewPanelSerializer {
    constructor(readonly deserialize: (view: vscode.WebviewPanel) => void) {}
    async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
    ) {
        this.deserialize(webviewPanel);
    }
}

function getNonce() {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export class WebView {
    private panel: vscode.WebviewPanel | undefined;

    constructor(readonly context: vscode.ExtensionContext) {
        const { subscriptions } = this.context;

        // open ui command
        subscriptions.push(
            vscode.commands.registerCommand(
                "extensions.datascienceeditor.open",
                this.handleOpen,
                this
            )
        );

        // reloaded from previous run
        subscriptions.push(
            vscode.window.registerWebviewPanelSerializer(
                "extension.devicescript.simulators",
                new WebViewSerializer(async view =>
                    this.handleDeserialize(view)
                )
            )
        );

        // track color theme
        vscode.window.onDidChangeActiveColorTheme(
            this.updateDeveloperToolsPanelUrl,
            this,
            subscriptions
        );
    }

    private async generateSimulatorsHtml() {
        const { kind: colorThemeKind } = vscode.window.activeColorTheme;
        const darkMode =
            colorThemeKind === vscode.ColorThemeKind.Dark ||
            colorThemeKind === vscode.ColorThemeKind.HighContrast
                ? "dark"
                : "light";
        const fullWebServerUri = await vscode.env.asExternalUri(
            vscode.Uri.parse(`http://microsoft.github.io/data-science-editor/`)
        );
        const cspSource = this.panel!.webview.cspSource;
        const nonce = getNonce();

        return `
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none'; frame-src ${fullWebServerUri} ${cspSource} https:; img-src ${fullWebServerUri} ${cspSource} https:; script-src ${fullWebServerUri} ${cspSource} 'nonce-${nonce}'; style-src ${fullWebServerUri} ${cspSource} 'nonce-${nonce}';"
        />
        <style nonce="${nonce}">
        body {
            margin: 0;
            padding: 0; 
            background-color: transparent;  
        }
        iframe {
            position: absolute;
            left: 0; right: 0;
            width: 100%; height: 100%;
            border: none;
        }
        </style>
        </head>
        <body>
        <iframe src="${fullWebServerUri}?embed=1&storage=0&footer=0&browsercheck=0&${darkMode}=1" />
        </body>
        </html>                
                        `;
    }

    private async updateDeveloperToolsPanelUrl() {
        const panel = this.panel;
        if (!panel) return;
        panel.webview.html = await this.generateSimulatorsHtml();
    }

    private async handleDeserialize(view: vscode.WebviewPanel) {
        if (!this.panel) {
            this.panel = view;
            await this.configureWebviewPanel();
        }
    }

    private async handleOpen() {
        if (this.panel) {
            this.panel.reveal(undefined, true);
            return;
        }

        console.log("Opening Data Science Editor...");
        this.panel = vscode.window.createWebviewPanel(
            "extension.datascienceeditor.editor",
            "Data Science Editor",
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );
        await this.configureWebviewPanel();
    }

    private async configureWebviewPanel() {
        this.panel?.onDidDispose(
            this.handleViewDispose,
            this,
            this.context.subscriptions
        );
        await this.updateDeveloperToolsPanelUrl();
    }

    private handleViewDispose() {
        this.panel = undefined;
    }
}

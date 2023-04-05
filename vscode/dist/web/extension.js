/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebView = void 0;
const vscode = __webpack_require__(2);
class WebViewSerializer {
    constructor(deserialize) {
        this.deserialize = deserialize;
    }
    async deserializeWebviewPanel(webviewPanel, state) {
        this.deserialize(webviewPanel);
    }
}
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
class WebView {
    constructor(context) {
        this.context = context;
        const { subscriptions } = this.context;
        // open ui command
        subscriptions.push(vscode.commands.registerCommand("extensions.datascienceeditor.open", this.handleOpen, this));
        // reloaded from previous run
        subscriptions.push(vscode.window.registerWebviewPanelSerializer("extension.devicescript.simulators", new WebViewSerializer(async (view) => this.handleDeserialize(view))));
        // track color theme
        vscode.window.onDidChangeActiveColorTheme(this.updateDeveloperToolsPanelUrl, this, subscriptions);
    }
    async generateSimulatorsHtml() {
        const { kind: colorThemeKind } = vscode.window.activeColorTheme;
        const darkMode = colorThemeKind === vscode.ColorThemeKind.Dark ||
            colorThemeKind === vscode.ColorThemeKind.HighContrast
            ? "dark"
            : "light";
        const fullWebServerUri = await vscode.env.asExternalUri(vscode.Uri.parse(`http://microsoft.github.io/data-science-editor/`));
        const cspSource = this.panel.webview.cspSource;
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
    async updateDeveloperToolsPanelUrl() {
        const panel = this.panel;
        if (!panel)
            return;
        panel.webview.html = await this.generateSimulatorsHtml();
    }
    async handleDeserialize(view) {
        if (!this.panel) {
            this.panel = view;
            await this.configureWebviewPanel();
        }
    }
    async handleOpen() {
        if (this.panel) {
            this.panel.reveal(undefined, true);
            return;
        }
        console.log("Opening Data Science Editor...");
        this.panel = vscode.window.createWebviewPanel("extension.datascienceeditor.editor", "Data Science Editor", vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        await this.configureWebviewPanel();
    }
    async configureWebviewPanel() {
        this.panel?.onDidDispose(this.handleViewDispose, this, this.context.subscriptions);
        await this.updateDeveloperToolsPanelUrl();
    }
    handleViewDispose() {
        this.panel = undefined;
    }
}
exports.WebView = WebView;


/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = void 0;
const webview_1 = __webpack_require__(1);
function activate(context) {
    const view = new webview_1.WebView(context);
}
exports.activate = activate;

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=extension.js.map
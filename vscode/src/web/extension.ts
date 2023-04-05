// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";
import { WebView } from "./webview";

export function activate(context: vscode.ExtensionContext) {
    const view = new WebView(context);
}

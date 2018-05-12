'use strict';

import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { Config } from './config';
import { QuickPicker, QuickPickerAction } from './quickPicker';
import { PathStyles } from './utils/pathStyles';
const clipboardy = require('clipboardy');

export class AbsolutePath {

    private readonly _config: Config;
    private get config(): Config {
        return this._config;
    }

    private readonly _quickPicker: QuickPicker;
    private get quickPicker(): QuickPicker {
        return this._quickPicker;
    }

    private readonly _statusBarItem: StatusBarItem;
    private get statusBarItem(): StatusBarItem {
        return this._statusBarItem;
    }

    private _unixStylePath: string = "";
    private get unixStylePath(): string {
        return this._unixStylePath;
    }
    private set unixStylePath(path: string) {
        this._unixStylePath = path.replace(/\\/g, "/");
    }

    private _windowsStylePath: string = "";
    private get windowsStylePath(): string {
        return this._windowsStylePath;
    }
    private set windowsStylePath(path: string) {
        this._windowsStylePath = path.replace(/\//g, "\\");
    }

    private _currentStyle: string;
    private get currentStyle(): string {
        if (this._currentStyle === PathStyles.UNIX) {
            return PathStyles.UNIX;
        }
        return PathStyles.WINDOWS;
    }
    private set currentStyle(style: string) {
        this._currentStyle = style;
    }

    private get currentPath(): string {
        if (this.currentStyle === PathStyles.UNIX) {
            return this.unixStylePath;
        }
        return this.windowsStylePath;
    }

    constructor() {
        this._config = new Config();
        this._quickPicker = new QuickPicker();
        this._currentStyle = this.config.defaultPathStyle;
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, this.config.priorityInStatusBar);
        this._statusBarItem.tooltip = "Open Menus";
        this._statusBarItem.command = 'absolutePath.executeQuickPickerAction';
        this.display();
    }

    public display() {
        let editor = window.activeTextEditor;
        if (!editor) {
            this.statusBarItem.hide();
            return;
        }
        this.unixStylePath = editor.document.uri.fsPath;
        this.windowsStylePath = editor.document.uri.fsPath;

        this.statusBarItem.text = this.currentPath;
        this.statusBarItem.show();
    }

    public executeQuickPickerAction() {
        this.quickPicker.getActionId(this.currentStyle).then((actionId) => {
            switch (actionId) {
                case QuickPickerAction.viewUnixStyle:
                    this.currentStyle = PathStyles.UNIX;
                    this.statusBarItem.text = this.currentPath;
                    return;
                case QuickPickerAction.viewWindowsStyle:
                    this.currentStyle = PathStyles.WINDOWS;
                    this.statusBarItem.text = this.currentPath;
                    return;
                case QuickPickerAction.copy:
                    clipboardy.writeSync(this.currentPath);
                default:
                    return;
            }
        });
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}

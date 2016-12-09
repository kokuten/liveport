const electron = require('electron');
import { shell } from 'electron';
const path = require('path')
import * as url from "url";
const BrowserWindow: typeof Electron.BrowserWindow = electron.BrowserWindow;
const app: Electron.App = electron.app;
const port = require("../config.json").port;
process.env.NODE_ENV = "production";

class Main {
    mainWindow: Electron.BrowserWindow = null;
    constructor(public app: Electron.App) {
        this.app.on('ready', this.onReady);
        this.app.on("window-all-closed", () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
        this.app.on('activate', function () {
            if (this.mainWindow === null) {
                this.createWindow();
            }
        });
    }

    onReady() {
        // Create the browser window.
        this.mainWindow = new BrowserWindow({
            width: 800, height: 600,
            icon: __dirname + '/assets/icon/favicon.png'
        });
        // disable menubar.
        this.mainWindow.setMenu(null);
        this.mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, "renderer", "html", 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
        this.mainWindow.webContents.on('new-window', (e, url) => {
            e.preventDefault();
            shell.openExternal(url);
        });
    }
}

var express = require("express");
var Express = express();
var http = require('http').Server(Express);
var socketio = require('socket.io')(http);
Express.get('/', function (req, res) {
    res.sendFile(__dirname + '/browser/html/browser.html');
});
Express.use("/js", express.static(__dirname + '/browser/js'));
socketio.on('connection', function (socket) {
    socket.on('message', function (msg) {
        socketio.emit('message', msg);
    });
    socket.on('aa', function (msg) {
        socketio.emit('aa', msg);
    });
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});
const myapp = new Main(app);
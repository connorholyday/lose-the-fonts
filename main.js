const { app, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs');
const glob = require('glob-fs')();
const mv = require('mv');

const fontsDirectory = 'test/';
const stashName = 'font-disabler-stash';
const stashDirectory = fontsDirectory + stashName;

let tray = null;
let stashed = false;

function start() {

    app.dock.hide();

    const iconPath = path.join(__dirname, 'icon.png');
    tray = new Tray(iconPath);

    tray.on('click', event => {
        stashed = !stashed;

        stashFonts(stashed);
    });

    setupContextMenu();
}

function setupContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Quit', role: 'quit' },
    ]);

    tray.on('right-click', _ => {
        tray.popUpContextMenu(contextMenu);
    });
}

function stashFonts(stash) {
    if (stash) {
        glob.readdirStream(fontsDirectory + '*')
            .on('data', function (file) {
                if (!file.isFile()) return;

                mv(file.path, stashDirectory + '/' + file.basename, { mkdirp: true }, (err) => {
                  if (err) throw err;
                });
            })
            .on('error', console.error)
            .on('end', function () {
                console.log('end');
            });
    } else {
        glob.readdirStream(stashDirectory + '/*')
            .on('data', function (file) {
                if (!file.isFile()) return;

                mv(file.path, fontsDirectory + file.basename, (err) => {
                  if (err) throw err;
                  console.log('renamed complete');
                });
            })
            .on('error', console.error)
            .on('end', function () {
                console.log('remove the dir');
                //fs.rmdirSync(stashDirectory);
                console.log('end');
            });
    }
}

app.on('ready', start);

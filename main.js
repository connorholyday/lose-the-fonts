const { app, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs-extra');
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

async function stashFonts(stash) {
    if (stash) {
        glob.readdirStream(fontsDirectory + '*')
            .on('data', function (file) {
                if (!file.isFile()) return;

                mv(file.path, stashDirectory + '/' + file.basename, { mkdirp: true }, (err) => {
                  if (err) throw err;
                });
            })
            .on('error', console.error);
    } else {
        const fileGlob = await glob.readdirPromise(stashDirectory + '/*');
        Promise.all(fileGlob.map(file => {
            return new Promise((resolve, reject) => {
                const fileName = file.substr(file.lastIndexOf('/') + 1);

                fs.move(file, path.join(__dirname, fontsDirectory + fileName), err => {
                    if (err) reject();
                    resolve();
                });
            });
        }))
        .catch(err => console.err(err))
        .then(() => {
            fs.rmdirSync(stashDirectory);
        });
    }
}

app.on('ready', start);

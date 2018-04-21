const { app, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob-fs')();
const mv = require('mv');

const fontsDirectory = 'test/';
const stashName = 'font-disabler-stash';
const stashDirectory = fontsDirectory + stashName;

let tray = null;
let stash_active = false;

function start() {

    app.dock.hide();

    const icon = {
        active: path.join(__dirname, 'iconTemplate.png'),
        inactive: path.join(__dirname, 'iconInactiveTemplate.png'),
    };
    tray = new Tray(icon.active);

    tray.on('click', event => {
        stash_active = !stash_active;

        if (stash_active) {
            tray.setImage(icon.inactive);
        } else {
            tray.setImage(icon.active);
        }

        stashFonts(stash_active);
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
        try {
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
        } catch (e) {
            console.error(e);
        }
    }
}

app.on('ready', start);

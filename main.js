const { app, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob-fs')();
const mv = require('mv');

const fontsDirectory = 'test/';
const stashName = 'font-disabler-stash';
const stashDirectory = fontsDirectory + stashName;

let tray = null;
let fonts_enabled = true;

function start() {

    app.dock.hide();

    tray = new Tray(getIcon(true));

    tray.on('click', event => {
        toggleFonts();
    });

    setupContextMenu();
}

function getIcon(is_active) {
    const icon = {
        active: path.join(__dirname, 'iconTemplate.png'),
        inactive: path.join(__dirname, 'iconInactiveTemplate.png'),
    };

    return is_active ? icon.active : icon.inactive;
}

function setIcon(is_active) {
    tray.setImage(getIcon(is_active));
}

function setupContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
        { label: 'All fonts', type: 'radio', click: () => toggleFonts(true) },
        { label: 'System fonts', type: 'radio', click: () => toggleFonts(false) },
        { label: 'Quit', role: 'quit' },
    ]);

    tray.on('right-click', _ => {
        tray.popUpContextMenu(contextMenu);
    });
}

async function toggleFonts(are_enabled = !fonts_enabled) {
    fonts_enabled = are_enabled;

    setIcon(are_enabled);

    if (!are_enabled) {
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

const { app, Menu, Tray } = require('electron');
const os = require('os');
const path = require('path');
const glob = require('glob-fs')();
const mv = require('mv');

const fontsDirectory = 'Library/Fonts/';
const stashDirectory = 'Library/FontDisabler/';

let tray = null;
let fonts_enabled = true;

function start() {
    process.chdir(os.homedir());
    app.dock.hide();
    setupTray();
}

function setupTray() {
    tray = new Tray(getIcon(true));
    tray.setHighlightMode('never');

    tray.on('click', event => {
        toggleFonts();
    });

    tray.on('right-click', _ => {
        tray.popUpContextMenu(getContextMenu(fonts_enabled));
    });
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

function getContextMenu(all_fonts = true) {
    const contextMenu = Menu.buildFromTemplate([
        { label: 'All fonts', type: 'radio', click: () => toggleFonts(true), checked: all_fonts},
        { label: 'System fonts', type: 'radio', click: () => toggleFonts(false), checked: !all_fonts },
        { label: 'Quit', role: 'quit' },
    ]);

    return contextMenu;
}

function toggleFonts(are_enabled = !fonts_enabled) {
    fonts_enabled = are_enabled;
    setIcon(are_enabled);

    if (!are_enabled) {
        stashFonts();
    } else {
        unStashFonts();
    }
}

function stashFonts() {
    glob.readdirStream(fontsDirectory + '*')
        .on('data', function (file) {
            if (!file.isFile()) return;

            mv(file.path, stashDirectory + file.basename, { mkdirp: true }, (err) => {
                if (err) throw err;
            });
        })
        .on('error', console.error);
}

function unStashFonts() {
    glob.readdirStream(stashDirectory + '*')
        .on('data', function(file) {
            if (!file.isFile()) return;

            mv(file.path, fontsDirectory + file.basename, (err) => {
                if (err) throw err;
            });
        })
        .on('error', console.error);
}

app.on('ready', start);

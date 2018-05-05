# Lose The Fonts

Toggles fonts on your local machine.
So that you can test that your font services are working.

## By why

When developing digital services it's important to check that
any custom fonts you are using are loading correctly. This
app will toggle any custom installed fonts to ensure that
you'll only be seeing the ones that your service are loading.

## How it works

On OSX your fonts are located in the `~/Library/Fonts/` directory.
This app works by moving these fonts to `~/Library/LoseTheFonts/`
when activated, and moving them back when deactivated.

## Build instructions

First install Electron and Electron Packager.

To run the app in development mode:
`npm run start`

To build the app:
`electron-packager . --overwrite --icon "./app-icon.icns"`

# TODOS

- [ ] Take screenshots
- [ ] Take videos
- [ ] Homebrew installation instructions
- [ ] Make landing page
- [ ] Add analytics
- [ ] Alfred script?

## License

MIT © [Connor Holyday](https://holyday.me)

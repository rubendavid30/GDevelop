'use strict';

// Test-only Android wrapper. Does not edit GDevelop's engine/editor source.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const here = __dirname;
const root = path.resolve(here, '..');
const editor = path.join(root, 'newIDE', 'app');
const built = path.join(editor, 'build');
const wrapper = path.join(here, '.work', 'cordova');
const isWin = process.platform === 'win32';
const npm = isWin ? 'npm.cmd' : 'npm';
const cordova = path.join(here, 'node_modules', '.bin', isWin ? 'cordova.cmd' : 'cordova');

function run(binary, args, cwd) {
  console.log('> ' + path.basename(binary) + ' ' + args.join(' '));
  const result = spawnSync(binary, args, { cwd, stdio: 'inherit', shell: isWin });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error('Command failed with exit ' + result.status + ': ' + binary);
}

function copyContents(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from))
    fs.cpSync(path.join(from, name), path.join(to, name), { recursive: true, force: true });
}

function main() {
  if (!fs.existsSync(path.join(root, 'GDJS', 'Runtime', 'runtimegame.ts')) ||
      !fs.existsSync(path.join(editor, 'package.json')))
    throw new Error('Place android-editor-prototype inside a full GDevelop source checkout.');
  if (!fs.existsSync(cordova))
    throw new Error('Run npm install in android-editor-prototype first.');

  if (process.env.GD_REUSE_WEB_BUILD !== '1') {
    if (!fs.existsSync(path.join(editor, 'node_modules')))
      run(npm, ['ci'], editor);
    run(npm, ['run', 'build'], editor);
  }

  const expected = ['index.html', 'libGD.js', 'libGD.wasm'];
  if (!expected.every(name => fs.existsSync(path.join(built, name))))
    throw new Error('GDevelop web output missing index.html/libGD.js/libGD.wasm.');

  if (!fs.existsSync(path.join(wrapper, 'config.xml'))) {
    fs.mkdirSync(path.dirname(wrapper), { recursive: true });
    run(cordova, ['create', wrapper, 'io.rubendavid30.gdeditortest', 'GD Editor Test', '--no-telemetry'], here);
  }
  fs.copyFileSync(path.join(here, 'config.xml'), path.join(wrapper, 'config.xml'));
  const www = path.join(wrapper, 'www');
  fs.rmSync(www, { recursive: true, force: true });
  copyContents(built, www);
  const index = path.join(www, 'index.html');
  const html = fs.readFileSync(index, 'utf8');
  if (!html.includes('</body>'))
    throw new Error('Generated index.html has no closing body tag.');
  fs.writeFileSync(index, html.replace('</body>', '<script src="cordova.js"></script>\n</body>'));

  if (!fs.existsSync(path.join(wrapper, 'platforms', 'android')))
    run(cordova, ['platform', 'add', 'android@13.0.0', '--save'], wrapper);
  run(cordova, ['build', 'android', '--debug'], wrapper);
  const apk = path.join(wrapper, 'platforms', 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  if (!fs.existsSync(apk)) throw new Error('Android build completed but APK is missing.');
  const destination = path.join(here, 'gdevelop-editor-test-debug.apk');
  fs.copyFileSync(apk, destination);
  console.log('Debug APK: ' + destination);
  console.log('NOT YET TESTED ON DEVICE. Test storage, preview, touch UI, and offline use.');
}

try { main(); } catch (error) { console.error('ERROR: ' + error.message); process.exitCode = 1; }

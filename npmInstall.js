//
// Script to read npm modules to install in a caching proxy like verdaccio.
//
const readline = require('readline');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const process = require('process');

let logs = '';
const logit = (text) => {
  console.log(text);
  logs += '\n' + text;
};
logit('npm-populate run on ' + (new Date()).toISOString());

const registry = process.env.NPMPOPULATE_REGISTRY;
const skip = process.env.NPMPOPULATE_SKIP;
if (skip) {
  logit('skipping over ' + skip);
}

// Operate in a build directory
const buildPath = 'build';
if (fs.existsSync(buildPath)) {
  childProcess.execSync('rmdir ' + buildPath + ' /s /q');
}
fs.mkdirSync(buildPath);

// We want to use a clean cache for this to make sure that all installs
// go through the npm registry without being served from a local npm cache.
const cachePath = './build/cache';
fs.mkdirSync(cachePath);

// use a dummy package.json in build
fs.copyFileSync('package.json.template', './build/package.json');

let commandParms = 'npm install --prefer-offline --no-save --global-style --no-package-lock --ignore-scripts --cache ./cache ';
if (registry) {
  commandParms += ' --registry ' + registry + ' ';
}

let moduleList = readline.createInterface({input: fs.createReadStream('./moduleList.txt')});
let modules = [];

let count = 0;
moduleList.on('line', function (line, lineCount, byteCount) {
  if (
    line.length &&
    line[0] !== ' ' &&
    line[0] !== '#' && // skip comments
    (!skip || (count++ > skip)) // allow skipping for testing 
  ) {
    modules.push(line);
  }
});

moduleList.on('close', () => {
  // Installs will be done in a subdirectory
  process.chdir('build');

  logit('Installing ' + modules.length + ' modules:');
  let printMe = '';
  const modulesClone = modules.slice(0);
  while (modulesClone.length) {
    const module = modulesClone.shift();
    printMe += ' ' + module;
    if (modulesClone.length % 4 === 0) {
      logit(printMe);
      printMe = '';
    }
  }
  installNextModule(commandParms, modules);
});

moduleList.on('error', function (e) {
  logit('Error installing modules: ' + e);
});

let finalCode = 0;

/**
 * Given an array of module names, runs npm install on each. Terminates
 * process when done.
 *
 * @param command String of npm command and options, missing final module name
 * @param moduleList Array of string with module names to install
 */
function installNextModule (command, moduleList) {
  const nextModule = moduleList.shift();
  if (nextModule) {
    console.log('Installing ' + nextModule);
    logs += '\nInstalling ' + nextModule;
    const cp = childProcess.spawn(command + nextModule, [], {
      shell: true,
      windowsHide: true
    });
    cp.stdout.on('data', (data) => {
      console.log(data.toString());
      logs += '\n' + data;
    });
    cp.stderr.on('data', (data) => {
      console.log(data.toString());
      logs += '\n' + data;
    });
    cp.on('close', (code) => {
      if (code !== 0) {
        finalCode = code;
      }
      if (moduleList.length) {
        setTimeout(() => installNextModule(command, moduleList), 0);
      } else {
        logit('Exit code: ' + finalCode);

        // Write the logs to a file
        const logPath = path.join(os.tmpdir(), 'npm-populate.log');
        fs.writeFileSync(logPath, logs);
        console.log('Wrote log file to ' + logPath);
        process.exit(finalCode);
      }
    });
  }
}

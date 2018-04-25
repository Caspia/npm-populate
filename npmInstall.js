//
// Script to read npm modules to install in a caching proxy like verdaccio.
//
const readline = require('readline');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const process = require('process');

const modules = [];
let modulesClone = [];
let logs = '';
let finalCode = 0;

const registry = process.env.NPMPOPULATE_REGISTRY || 'http://localhost:4873';
const skip = process.env.NPMPOPULATE_SKIP;
console.log('os is ' + os.type())
const rmcmd = (/Linux/.test(os.type())) ? 'rm -rf ' : 'rmdir /s /q ';
console.log('remove directory command: ' + rmcmd);

function rmdir(path) {
  childProcess.execSync(rmcmd + path);
}

logit('npm-populate run on ' + (new Date()).toISOString());
if (skip) {
  logit('skipping packages, only installing ' + skip);
}

// Operate in a build directory
const buildPath = path.join(__dirname, 'build');

//let commandParms = 'npm install --prefer-offline --no-save --global-style --no-package-lock --ignore-scripts --cache ../cache ';
let commandParms = 'npm install --prefer-offline --no-save --no-package-lock --ignore-scripts --cache ../cache ';
if (registry) {
  commandParms += ' --registry ' + registry + ' ';
}

let moduleList = readline.createInterface({input: fs.createReadStream('./moduleList.txt')});

let count = 0;
moduleList.on('line', function (line, lineCount, byteCount) {
  if (
    line.length &&
    line[0] !== ' ' &&
    line[0] !== '#' && // skip comments
    (!skip || (count++ < skip)) // allow skipping for testing 
  ) {
    modules.push(line);
  }
});

moduleList.on('error', function (ex) {
  logit('Error reading module list: ' + ex);
});

moduleList.on('close', () => {
  installModules().then(() => {
    // Write the logs to a file
    const logPath = path.join(os.tmpdir(), 'npm-populate.log');
    fs.writeFileSync(logPath, logs);
    console.log('Wrote log file to ' + logPath);
    logit('Final code is ' + finalCode);
    process.exit(finalCode);
  }).catch((ex) => {
    console.log('Error installing modules: ' + ex);
  });
});

async function installModules () {
  // Print the list of modules
  logit('Installing ' + modules.length + ' modules:');
  let printMe = '';
  modulesClone = modules.slice(0);
  const modulesLocal = modules.slice(0);
  while (modulesLocal.length) {
    const module = modulesLocal.shift();
    printMe += ' ' + module;
    if (modulesLocal.length % 4 === 0) {
      logit(printMe);
      printMe = '';
    }
  }

  // We want to use a clean cache for this to make sure that all installs
  // go through the npm registry without being served from a local npm cache.
  const cachePath = path.join(__dirname, 'cache');
  if (fs.existsSync(cachePath)) {
    process.chdir(__dirname);
    //rmdir('cache');
  }
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath);
  }

  // Install all modules
  for (let module = modules.shift(); module; module = modules.shift()) {
    await installNextModule(commandParms, module);
  }
}

async function installNextModule (command, nextModule) {
  if (fs.existsSync(buildPath)) {
    process.chdir(__dirname);
    rmdir('build');
  }
  fs.mkdirSync(buildPath);
  process.chdir(buildPath);

  if (nextModule) {
    try {
      let resultText = '';
      let packagePath = '';
      if (nextModule.startsWith('https://')) {
        // Although npm supports an install from a git repository, that does not
        // install devDependencies which we really want. So clone the git repository
        // locally then use a normal npm install.
        logit('git cloning ' + nextModule);
        resultText = await promiseCommand('git clone ' + nextModule + ' ./');
        logit(resultText);
        logit('Installing ' + nextModule);
        resultText = await promiseCommand(command);
        packagePath = 'package.json';
      } else {
        // use a dummy package.json in build
        fs.copyFileSync(path.join(__dirname, 'package.json.template'), path.join(__dirname, 'build', 'package.json'));
        logit('Installing ' + nextModule);
        resultText = await promiseCommand(command + nextModule);
        packagePath = path.join('node_modules', nextModule, 'package.json');
      }

      logit(resultText);

      const packageJSON = fs.readFileSync(packagePath);
      const packageObj = JSON.parse(packageJSON);
      for (const key in packageObj.peerDependencies) {
        logit('Peer dependency: ' + key + ' ' + packageObj.peerDependencies[key]);
        if (modulesClone.includes(key)) {
          logit('Already installing ' + key);
        } else {
          modulesClone.push(key);
          modules.push(key);
          logit('Adding peer dependency to install list: ' + key);
        }
      }
    } catch (ex) {
      logit('Failed to get package.json for ' + nextModule);
    }
  }
}

function promiseCommand (command) {
  return new Promise((resolve, reject) => {
    let result = '';
    const cp = childProcess.spawn(command, [], {
      shell: true,
      windowsHide: true
    });
    cp.stdout.on('data', (data) => {
      result += data;
    });
    cp.stderr.on('data', (data) => {
      result += data;
    });
    cp.on('close', (code) => {
      if (code === 0) {
        resolve(result);
      } else {
        finalCode = code;
        reject(new Error(result));
      }
    });
  });
}

function logit (text) {
  console.log(text);
  logs += '\n' + text;
};

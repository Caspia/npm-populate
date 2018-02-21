/**
 * Cleans the package.json files in the verdaccio storage so that only versions available
 * locally are reported. This prevents verdaccio from silently attempting to contact
 * the parent registry in offline mode.
 *
 * Usage:
 *   Takes one paramater, which is the full path to the directory containing the verdaccio
 *   storage files. Example: node npmClean.js /srv/verdaccio/20180221
 */

 const process = require('process');
 const fs = require('fs');
 const path = require('path');

 // directory to clean
const directory = process.argv[2];
if (!directory || directory == 'help' || directory == '--help' || directory == '-h') {
  console.log('usage (as root): node npmClean.js <directory>');
  process.exit(1);
} else if (!fs.existsSync(directory)) {
  console.log(directory + ' does not exist');
  process.exit(2);
}
console.log('Cleaning directory ' + directory);

// Get the full list of included modules

const modules = fs.readdirSync(directory);

modules.forEach(module => {
  do {
    const modulePath = path.join(directory, module);
    const stats = fs.lstatSync(modulePath);
    if (!stats.isDirectory()) {
      console.log(module + ' is not a directory, skipping');
      continue;
    }
    console.log('Processing module: ' + module);

    const packagePath = path.join(modulePath, 'package.json');
    if (!fs.existsSync(packagePath)) {
      console.log('no package.json found, skipping ' + module);
      continue;
    }
    // make a list of included versions
    const versions = [];
    const files = fs.readdirSync(modulePath);
    files.forEach(file => {
      if (!file.endsWith('.tgz')) {
        return;
      }
      // parse out the version and add. Remove from front name + '-', from end .tgz
      versions.push(file.slice(module.length + 1, -4));
    })
    console.log('found versions: ' + versions);

    // Read in the module summary file
    const package = JSON.parse(fs.readFileSync(packagePath));
    for (version in package.versions) {
      if (!versions.includes(version)) {
        delete package.versions[version];
        continue;
      } else {
      console.log('including version ' + version);
      }
    }
    // Make sure we have the latest
    if(!versions.includes(package["dist-tags"].latest)) {
      versions.sort(); // Make sure the latest is last
      console.log('We don\'t have the latest, rewriting latest from ' + package["dist-tags"].latest + ' to ' + versions[versions.length - 1]);
      package["dist-tags"].latest = versions[versions.length - 1];
    }
    //console.log(package.versions);
    // rewrite the file
    fs.writeFileSync(packagePath, JSON.stringify(package));
    //console.log('rewrote ' + packagePath);
  } while (false);
});
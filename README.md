# npm-populate
Exercises an npm registry with the intent of caching modules for offline use.

## Introduction
Generally, this program runs through a list of npm modules stored in moduleList.txt,
and asks whatever underlying npm registry is attached to install them. The assumption
is that the registry maintains some sort of cache for offline use, that is populated
whenever a module is installed.

## Running
Run this file from the command line, in the same directory as this file.
```
node npmInstall.js
```
Some of the modules in moduleList.txt rely on a functional git either explicitly or explicitly.
Running this program in a bash command prompt installed using a standard Windows git install
works well.

Note this file assumes it is running on Windows. Also, npm install is
not needed to run, only for development to support eslint.

Two environment variables are used, both optional:

NPMPOPULATE_REGISTRY: URL to use in setting the npm registry (else use the default registry)
NPMPOPULATE_SKIP: Install only this number of modules in module list, for quick testing.

## Post Processing
After running npmInstall, the registry used will contain a registry package.json file for each
module that contains information on the current availability of modules at the parent registry
(typically https://registry.npmjs.org/). When a verdaccio offline install tries to use that registry,
two problems can occur:

1.  If you try to install a version of the module that is not cached locally, verdaccio will phone
home to parent registry and retrieve it anyway. This causes confusion in testing.

2.  In some cases, modules were installed as dependencies of other modules, and the cached version might
not be the latest version. If you then tried to directly install that module (which uses the latest by
default), again it is not available locally. This will result in a failed install (unless you work around
it by specifying the version of the module in the cache).

To get around these two issues, the package.json files for each module must be cleaned up to only include
the local information prior to using the cache offline. This is the purpose of npmClean.js. To use this, on
a server containing an install of node as well as the verdaccio cache, run npmClean. For a verdaccio cache
located at /srv/verdaccio/20180221 for example, run as root:
```
node npmClean.js /srv/verdaccio/20180221

License: Public Domain (Creative Commons CC0 https://wiki.creativecommons.org/wiki/CC0)


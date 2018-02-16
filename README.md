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
NPMPOPULATE_SKIP: Skips this number of modules in module list, for quick testing

License: Public Domain (Creative Commons CC0 https://wiki.creativecommons.org/wiki/CC0)


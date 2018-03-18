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
Some of the modules in moduleList.txt rely on a functional git either implicitly or explicitly.
Running this program in a bash command prompt installed using a standard Windows git install
works well.

Note this file assumes it is running on Windows. Also, npm install is
not needed to run, only for development to support eslint.

Two environment variables are used, both optional:

NPMPOPULATE_REGISTRY: URL to use in setting the npm registry (else use the default registry)
NPMPOPULATE_SKIP: Install only this number of modules in module list, for quick testing.

## Typical setup of registry to populate

First, you will need a working Docker installation (typically using a Linux server) including both docker and docker-compose. Check Docker
for instructions on how to set that up.

On the Docker host, we use volumes located at /srv/verdaccio to store the verdaccio cache that we want
to populate.

To initially populate a verdaccio cache with this program, you need to setup an empty verdaccio
storage cache in a verdaccio container. The ```release``` directory here allows creation of an
appropriate Docker image. Here are instructions using that to setup a blank repository.

The verdaccio build in ./release uses a file ".env" containing configuration variables to store information
about a particular populate run. A template for that file is in release/env-template. Copy that file to /release/.env
and modify according to your run. The three variables there are:

*PORT*: The numeric port that will be used on the host Docker system to serve the verdaccio instance.
*RELEASE*: A name for this particular version of the created verdaccio cache. Typically this is just given as
a date, like 20180315
*CONFIGFILE*: This has one of two values. Use configOnline.yaml for runs that use the base npm registry to
populate a cache, and config.yaml after populating to prevent further updates from the base npm registry.

First, create a folder on the Docker host called /srv/verdaccio/$RELEASE (I'll assume that RELEASE is 20180315 in
further instuctions). That folder then needs to have ownership set so that the verdaccio image can access it. Example:
```
mkdir -p /srv/verdaccio/20180315
rm -rf /srv/verdaccio/20180315/*
chown 100:101 /srv/verdaccio/20180315
```
(These steps can also be done by running ./release/.makeNewVolume.sh which will read variables from .env)

Now build and start the verdaccio container on the Docker host. In the ./release directory, run:
```
docker-compose build
docker-compose up -d
```

You can follow the logs for the container with the command:
```
docker logs -f verdaccio
```

To stop the verdaccio container (which will otherwise automatically restart)
```
docker-compose down
```

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
sudo node npmClean.js /srv/verdaccio/20180221

License: Public Domain (Creative Commons CC0 https://wiki.creativecommons.org/wiki/CC0)

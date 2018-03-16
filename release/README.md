# Instructions to create a release demo for npm

## Demo server

(1) Get a copy of the verdaccio storage folder for the release. This should be listed in https://caspia.github.io/datalinks.html For example, the release 20180216 points to: https://s3-us-west-2.amazonaws.com/ope-verdaccio/2018216/verdaccio.tar.gz

(2) Extract that file to a folder under /srv with the correct ownership. So for example, the 20180216 release is extracted as follows:
```
cd /srv/verdaccio
sudo tar --owner=100 --group=101 -xf 20180216.tar.gz
```

(This .tar.gz was created using:)
```
sudo tar --owner=100 --group=101 --numeric-owner -czf 20180216.tar.gz 20180216
```

(3) If using the container in npm-populate/release, then make sure
that .env exists there (copied from env-template if missing), and
that the variables are set correctly. That is, RELEASE matches the
version string for the tar.gz file (like RELEASE=20180216) and CONFIGFILE points to the offline config file (like CONFIGFILE=config.yaml)

(4) Start the docker container (from folder npm-populate/release)
```
docker-compose up -d
```

(5) Save a copy of the logfile in https://github.com/Caspia/caspia.github.io. For example, the 20180216 logfile is at ./npmdemo/20180216

(6) Update links on index.html at https://github.com/Caspia/caspia.github.io to add the release to the list of available demos. There should be links for the logfile, for the demo site, and for the .tar.gz file.

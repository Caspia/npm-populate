# Instructions to create a release demo for npm

## Demo server

1. Get a copy of the verdaccio storage folder for the release. This should be listed in https://caspia.github.io/datalinks.html For example, the release 20180216 points to: https://s3-us-west-2.amazonaws.com/ope-verdaccio/2018216/verdaccio.tar.gz

1. Extract that file to a folder under /srv with the correct ownership. So for example, the 20180216 release is extracted as follows:
```
cd /srv/verdaccio
sudo tar --owner=100 --group=101 -xf 20180216.tar.gz
sudo mv verdaccio 20180216
```

(Create this using:)
```
sudo tar --owner=100 --group=101 --numeric-owner -czf 20180216.tar.gz 20180216

1. Start the docker container (from folder npm-populate/release)
```
docker-compose up -d
```

1. Save a copy of the logfile in https://github.com/Caspia/caspia.github.io. For example, the 20180216 logfile is at ./npmdemo/20180216

1. Update links on index.html at https://github.com/Caspia/caspia.github.io to add the release to the list of available demos. There should be links for the logfile, for the demo site, and for the .tar.gz file.
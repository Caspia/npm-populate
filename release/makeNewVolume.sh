. .env
mkdir -p /srv/verdaccio/$RELEASE
rm -rf /srv/verdaccio/$RELEASE/*
chown 100:101 /srv/verdaccio/$RELEASE
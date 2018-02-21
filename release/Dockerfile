FROM verdaccio/verdaccio:2.7.4

ARG CONFIGFILE
ENV CONFIGFILE ${CONFIGFILE:-config.yaml}
ENV PORT 4873
ENV PROTOCOL http
ENV APPDIR /usr/local/app

# Adapted from ope-verdaccio from the ope project

MAINTAINER R Kent James <rkent@caspia.org>
LABEL Description="NPM offline repository demo" Version="0.1"
COPY ./config.yaml /verdaccio/conf/config.yaml
COPY ./configOnline.yaml /verdaccio/conf/configOnline.yaml


# These lines are changed for each demo release

VOLUME ["/verdaccio/storage"]

CMD $APPDIR/bin/verdaccio --config /verdaccio/conf/$CONFIGFILE --listen $PROTOCOL://0.0.0.0:${PORT}

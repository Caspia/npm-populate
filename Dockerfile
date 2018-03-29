FROM verdaccio/verdaccio:2.7.4

# Adapted from ope-verdaccio from the ope project

MAINTAINER R Kent James <rkent@caspia.org>
LABEL Description="NPM offline repository demo using verdaccio" Version="2.7.4"
COPY ./config.yaml /verdaccio/conf/config.yaml
COPY ./configOnline.yaml /verdaccio/conf/configOnline.yaml

VOLUME ["/verdaccio/storage"]

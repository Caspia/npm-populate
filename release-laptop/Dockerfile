FROM jwilder/nginx-proxy:alpine

# Adapted from ope-dns of githubb.com/operepo/ope

RUN apk --no-cache add dnsmasq
EXPOSE 53 53/udp
ENTRYPOINT ["dnsmasq", "-k"]

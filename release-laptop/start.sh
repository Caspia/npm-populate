. ./.env
docker kill nginx-proxy
docker rm nginx-proxy
docker run --name nginx-proxy -d --network=nginx-proxy -p 80:80 --restart=always --env-file .env -v /var/run/docker.sock:/tmp/docker.sock:ro jwilder/nginx-proxy:alpine
docker kill dnsmasq-proxy
docker rm dnsmasq-proxy
docker run --name dnsmasq-proxy -d --network=nginx-proxy -p 53:53/tcp -p 53:53/udp --restart=always -e DOMAIN=$DOMAIN -e IP_ADDR=$IP_ADDR --cap-add NET_ADMIN rkent/dnsmasq:proxy -A /$DOMAIN/$IP_ADDR
docker kill verdaccio
docker rm verdaccio
docker run --name verdaccio -d --network=nginx-proxy -p 4873:4873 --env-file .env --restart=always -v /opt/verdaccio:/verdaccio/storage:rw verdaccio:caspia /usr/local/app/bin/verdaccio --config /verdaccio/conf/$CONFIGFILE --listen http://0.0.0.0:4873
#!/bin/sh
set -xe
until mc alias set myminio http://minio.app-network:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD";
do
    echo '...waiting...'
    sleep 1
done
mc rb --force myminio/config;
mc mb --quiet myminio/config;
mc put /root/test/python/event-config.yml myminio/config/event-configs/python.yml;
mc put /root/test/ts/event-config.yml myminio/config/event-configs/ts.yml;
exit 0;
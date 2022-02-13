unzip -o build_aita_api.zip -d /srv/aita-api
rm -rf build_aita_api.zip
rm -rf install_aita_api.sh
pm2 reload aita-api

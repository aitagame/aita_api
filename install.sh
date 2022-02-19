rm -rf /srv/aita-api;

unzip -o build_aita_api.zip -d /srv/aita-api;
rm -rf build_aita_api.zip;
rm -rf install_aita_api.sh;
pm2 reload aita-api;

#Only for QA environment, production should be migrated manually
if [[ $BRANCH == "develop" ]]; then
    cd /srv/aita-api;
    npm run db:migrate;
fi;

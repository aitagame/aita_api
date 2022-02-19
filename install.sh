rm -rf /srv/aita-api;

unzip -o build_aita_api.zip -d /srv/aita-api;
rm -rf build_aita_api.zip;
rm -rf install_aita_api.sh;
pm2 reload aita-api;

#Only for QA environment, production should be migrated manually
if [[ $BRANCH == "develop" ]]; then
    cd /srv/aita-api;
    #Modules with executables, compiled on CircleCI env appear to not be compatible with ubuntu 20
    rm -rf node_modules;
    npm i;
    
    npm run db:migrate;
fi;

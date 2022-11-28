#! /bin/bash

folder=$1

cd folder
rm -rf poker
git clone https://github.com/jonahdlin/poker.git

cd poker/server
npm run build-prod

cd ../../
mv poker/server/dist ./

pm2 delete server
pm2 start server.js
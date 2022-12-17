#! /bin/bash

git checkout main
git fetch
git pull

cd server
npm run build-prod

pm2 delete server
pm2 start NODE_ENV=production dist/server.js
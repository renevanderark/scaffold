#!/bin/bash

sudo apt-get install git-core curl build-essential openssl libssl-dev mongodb

git clone https://github.com/joyent/node.git
cd node
git checkout v0.6.3
./configure
make
sudo make install
curl http://npmjs.org/install.sh | sudo sh
cd ../srv
mkdir node_modules
npm install faye mongodb mongojs node-static qs
cd ..
rm -rf node
cd srv
echo "please surf to localhost:8000"
node test.js

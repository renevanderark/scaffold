/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

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
node server.js

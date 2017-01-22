#!/usr/bin/env bash

sudo apt-get install -y curl
sudo apt-get install -y build-essential
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install npm@latest -g
sudo npm install pm2@latest -g

cd /vagrant
npm install
#!/usr/bin/env bash

# Install nodejs , npm and pm2
sudo apt-get install -y curl
sudo apt-get install -y build-essential
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install npm@latest -g
sudo npm install pm2@latest -g

# Install MySQL server 5.6
sudo apt-get -y install software-properties-common python-software-properties
sudo add-apt-repository -y ppa:ondrej/mysql-5.6
sudo apt-get update
export DEBIAN_FRONTEND="noninteractive"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password password 123456"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password_again password 123456"
sudo apt-get -y install mysql-server


cd /vagrant
npm install



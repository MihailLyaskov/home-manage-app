#!/usr/bin/env bash

# Install nodejs , npm and pm2
sudo apt-get install -y curl
sudo apt-get install -y build-essential
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install npm@latest -g
sudo npm install pm2@latest -g

# Install MongoDB
sudo apt-get install -y mongodb

# Install MySQL server 5.6
# Set the Server Timezone
sudo timedatectl set-timezone Europe/Sofia


# Install essential packages
sudo apt-get -y install zsh htop

sudo apt-get -y install software-properties-common python-software-properties
sudo add-apt-repository -y ppa:ondrej/mysql-5.6
sudo apt-get update

# Install MySQL Server in a Non-Interactive mode. Default root password will be "root"
echo "mysql-server-5.6 mysql-server/root_password password root" | sudo debconf-set-selections
echo "mysql-server-5.6 mysql-server/root_password_again password root" | sudo debconf-set-selections
sudo apt-get -y install mysql-server-5.6


# Run the MySQL Secure Installation wizard
mysql_secure_installation

sudo sed -i 's/127\.0\.0\.1/0\.0\.0\.0/g' /etc/mysql/my.cnf
mysql -uroot -p -e 'USE mysql; UPDATE `user` SET `Host`="%" WHERE `User`="root" AND `Host`="localhost"; DELETE FROM `user` WHERE `Host` != "%" AND `User`="root"; FLUSH PRIVILEGES;'

sudo service mysql restart


cd /vagrant
npm install

source /vagrant/services/Database-service/scripts/script.sh




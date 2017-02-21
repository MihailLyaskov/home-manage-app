#!/usr/bin/env bash

mysql -uroot -proot < /vagrant/services/Database-service/scripts/scheme_and_user.sql
mysql -uroot -proot < /vagrant/services/Database-service/scripts/database.sql

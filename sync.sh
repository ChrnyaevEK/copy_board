#!/bin/bash
# synchronization script for project files except for DB file
rsync -avhze ssh --exclude="*.sqlite3" --exclude="*.idea" --exclude="*.git" /home/egor/Documents/working/toptools root@toptools.tech:/var/www/django


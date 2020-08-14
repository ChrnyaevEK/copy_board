#!/bin/bash
# synchronization script for project files except for DB file
rsync -avhze ssh --exclude="*.sqlite3" --exclude="*.idea"  --exclude="*.cache"  --exclude="*__pycache__*" --exclude="*.git" --exclude="venv" --delete /home/egor/Documents/working/toptools root@toptools.tech:/var/www/django


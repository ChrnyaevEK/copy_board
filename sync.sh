#!/bin/bash
# synchronization script for project files
rsync -avhze ssh \
--exclude="*.sqlite3" \
--exclude="*.idea"  \
--exclude="*.cache"  \
--exclude="*__pycache__*" \
--exclude="*.git" \
--exclude="venv" \
--exclude="plugins" \
--exclude="copy_board/migrations" \
--delete /home/egor/Documents/working/toptools root@toptools.tech:/var/www/django && kill -HUP `cat /tmp/toptools_uwsgi.pid`

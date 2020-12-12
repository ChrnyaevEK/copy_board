errorlog = '/tmp/gunicorn.log'
loglevel = 'warning'
bind = '127.0.0.1:10000'
daemon = False
workers = 4
worker_class = 'sync'
threads = 2

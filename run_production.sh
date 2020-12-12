ps aux | grep toptools | awk '{print $2}' | xargs kill || true
gunicorn -c "python:gunicorn" "toptools.wsgi:application"
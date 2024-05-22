import os
from pathlib import Path
from flask import send_from_directory
from tqdme.server import Server
from gevent.pywsgi import WSGIServer


script_directory = Path(__file__).parent.resolve()

PORT = int(os.environ.get("PORT", 3768)) # Use 8080 if run standalone locally
HOST = os.getenv('HOST') or 'localhost'


def start_production_server(host, port, app):
    http_server = WSGIServer((host, port), app)
    http_server.serve_forever()

    
def create_server():

    print(f"Starting server at http://{HOST}:{PORT}")

    server = Server(script_directory.parent, HOST, PORT)
    app = server.app

    # Add application-specific routes
    @app.route('/src/<path:path>')
    def get_static_assets(path):
        return send_from_directory(script_directory.parent / 'src', path)
    
    return server


# Run locally
if __name__ == "__main__":

    server = create_server()
    start_production_server(HOST, PORT, server.app)

# Using gunicorn
else:
    server = create_server()
    app = server.app
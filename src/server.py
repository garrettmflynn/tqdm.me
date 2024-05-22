import os
from pathlib import Path
from flask import send_from_directory
from tqdme.server import Server
from gevent.pywsgi import WSGIServer


script_directory = Path(__file__).parent.resolve()

def start_production_server(host, port, app):
    http_server = WSGIServer((host, port), app)
    http_server.serve_forever()


if __name__ == "__main__":

    PORT = int(os.environ.get("PORT", 8080)) # Use 8080 if run standalone locally
    HOST = os.getenv('HOST') or 'localhost'
    
    print(f"Starting server at {HOST}:{PORT}")

    server = Server(script_directory.parent, HOST, PORT)
    app = server.app

    # Add application-specific routes
    @app.route('/src/<path:path>')
    def get_static_assets(path):
        return send_from_directory(script_directory.parent / 'src', path)
    
    start_production_server(HOST, PORT, app)

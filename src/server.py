import eventlet
eventlet.monkey_patch()

import os
from pathlib import Path
from flask import send_file, send_from_directory
from tqdme.server import Server

script_directory = Path(__file__).parent.resolve()

if __name__ == "__main__":
    env_port = os.getenv('PORT')
    PORT = int(env_port) if env_port else 8080
    HOST = os.getenv('HOST') or 'localhost'

    server = Server(script_directory.parent, HOST, PORT)
    app = server.app

    # Add application-specific routes
    @app.route('/src/<path:path>')
    def get_static_assets(path):
        return send_from_directory(script_directory.parent / 'src', path)
    
    server.run()

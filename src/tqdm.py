import eventlet
eventlet.monkey_patch()

import os
from pathlib import Path
from flask import send_file, send_from_directory
from tqdme.server import create


script_directory = Path(__file__).parent.resolve()

if __name__ == "__main__":
    env_port = os.getenv('PORT')
    PORT = int(env_port) if env_port else 8080
    HOST = os.getenv('HOST') or 'localhost'
    app, socketio = create(HOST, PORT, True)

    # Add application-specific routes
    @app.route('/')
    def index():
        return send_file(script_directory.parent / 'index.html')

    @app.route('/src/<path:path>')
    def get_static_assets(path):
        return send_from_directory(script_directory.parent / 'src', path)
    

    @app.route('/view/<path:path>')
    def view(path):
        return send_file(script_directory.parent / 'index.html')
    
    socketio.run(app, host=HOST, port=PORT)

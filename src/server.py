import os
from pathlib import Path
from flask import send_from_directory
from tqdme.server import Server

script_directory = Path(__file__).parent.resolve()

PORT = int(os.environ.get("PORT", 8080)) # Use 8080 if run standalone locally
HOST = os.getenv('HOST') or 'localhost'

    
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
    server.run()

# Using gunicorn
else:
    server = create_server()
    app = server.app
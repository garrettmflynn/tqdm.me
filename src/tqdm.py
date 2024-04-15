import eventlet
eventlet.monkey_patch()

import os
import json
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import cross_origin
from flask_socketio import SocketIO, join_room, leave_room
from pathlib import Path

script_directory = Path(__file__).parent.resolve()

def get_url(host, port, metadata):
    ip = metadata["ip"]
    page_id = str(ip)
    return f"http://{host}:{port}/view/{page_id}" 

def start_server(host, port):

    app = Flask(__name__)
    app.config['CORS_HEADERS'] = 'Content-Type'
    socketio = SocketIO(app, cors_allowed_origins="*")

    STATES = {}

    @app.route('/')
    def index():
        return send_file(script_directory.parent / 'index.html')

    @app.route('/src/<path:path>')
    def get_static_assets(path):
        return send_from_directory(script_directory.parent / 'src', path)
    

    @app.route('/view/<path:path>')
    def view(path):
        return send_file(script_directory.parent / 'index.html')

    @app.route('/update', methods=['POST'])
    @cross_origin()
    def update():
        data = json.loads(request.data) if request.data else {}

        ip = data["ip"] = request.remote_addr # Add request IP address

        # Send to frontend
        socketio.emit('progress', data, room=ip)

        response = dict( ok = True )

        # Create pages for each unique IP address
        page_id = str(ip)
        identifier = f"{data['ppid']}/{data['pid']}/{data['id']}"
        group_exists = page_id in STATES
        if not group_exists:
            STATES[page_id] = {}      
            url = get_url(host, port, data)
            response = dict( url = url ) # Echo
            socketio.emit('onipadded', dict(id = page_id, url = url ))

        STATES[page_id][identifier] = data["format"]

        return jsonify(response)
    
    @socketio.on('subscribe')
    def subscribe(page_id):
        ip = page_id
        join_room(ip) # Join room with IP address
        socketio.emit('init', dict(ip=ip, states=STATES.get(ip, {}))) # Send initial state to client

    @socketio.on('unsubscribe')
    def unsubscribe(page_id):
        ip = page_id
        leave_room(ip) # Leave room with IP address


    @socketio.on('discover')
    def discover():
        ips = {}
        for ip in STATES.keys():
            ips[ip] = get_url(host, port, dict(ip=ip))
        socketio.emit('ips', ips)
    

    @socketio.on('connect')
    def handle_connect(socket):
        print('Client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    socketio.run(app, host=host, port=port)

if __name__ == "__main__":
    env_port = os.getenv('PORT')
    PORT = int(env_port) if env_port else 8080
    HOST = os.getenv('HOST') or 'localhost'
    start_server(HOST, PORT)

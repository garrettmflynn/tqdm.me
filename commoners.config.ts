// ------------- PRODUCTION -------------
import * as bluetoothPlugin from '@commoners/bluetooth'
import * as serialPlugin from '@commoners/serial'
import localServicesPlugin from '@commoners/local-services'
// import { defineConfig } from 'commoners' // NOTE: commoners dependencies are missing in local development...

// // ------------- DEVELOPMENT -------------
// import * as bluetoothPlugin from '../commoners/packages/plugins/devices/ble/index.js'
// import * as serialPlugin from '../commoners/packages/plugins/devices/serial/index.js'
// import localServicesPlugin from '../commoners/packages/plugins/local-services/index.js'
// import { defineConfig } from '../commoners/packages/core/index' // NOTE: commoners dependencies are missing in local development...

// ------------- PACKAGE CHANGES -------------
// "commoners": "file:../commoners/packages/cli",


const defineConfig = (o) => o 

export default defineConfig({
    
    // icon: './icon.png', 

    electron: {
        splash: './splash.html',
        window: {
            width: 1000 // Adjust default width
        }
    },


    plugins: {
        bluetooth: bluetoothPlugin,
        serial: serialPlugin,
        localServices: localServicesPlugin((ip, env) => {
            const isLocalIP = ip === 'localhost'
            const hasAuthString = process.env.SHARE_SECRET_KEY === env.SHARE_SECRET_KEY
            return hasAuthString || isLocalIP
        }),

        selectiveBuilds:{
            isSupported: {
                desktop: {
                    load: true
                },
                mobile: {
                    load: true
                },
                web: {
                    load: false
                }
            },
            main: () => {
                console.log(`desktop build (main)`)
            },
            preload: () => {
                console.log(commoners.target + ' build (preload)')
            },
            render: () => console.log(commoners.target + ' build (render)'),

        }
    },

    services: {

        // Packaged with pkg
        dynamicNode: {
            description: 'A simple Node.js server',
            src: './src/services/node/index.js',
            publish: 'https://node-production-aa81.up.railway.app/'
        },

        localNode: {
            description: 'A local Node.js server',
            src: './src/services/node/index.js',
            publish: true // Any local configuration defaults to this
        },

        // Packaged with pyinstaller
        python: {
            description: 'A simple Python server',
            src: './src/services/python/main.py',
            port: 1111,
            publish: {
                build: 'python -m PyInstaller --name flask --onedir --clean ./src/services/python/main.py --distpath ./build/python',
                remote: 'https://python-production-4f11.up.railway.app',
                local: {
                    src: 'flask',
                    base: './build/python/flask', // Will be copied
                }
            }
        },

        remote: 'https://jsonplaceholder.typicode.com',

        dynamic: {
            src: 'http://localhost:1111', // Call the python server in development
            publish: 'https://jsonplaceholder.typicode.com'
        }
    }
})
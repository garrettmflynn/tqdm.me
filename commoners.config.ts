const defineConfig = (o) => o 

export default defineConfig({
    
    icon: './icon.png', 

    services: {

        // Packaged with pyinstaller
        tqdm: {
            description: 'TQDM Relay Server',
            src: './src/tqdm.py',
            port: 3768,
            publish: {
                build: 'python -m PyInstaller --name tqdm --onedir --clean ./src/tqdm.py --distpath ./build/tqdm',
                // remote: 'https://python-production-4f11.up.railway.app',
                local: {
                    src: 'tqdm',
                    base: './build/tqdm/tqdm', // Will be copied
                }
            }
        }
    }
})
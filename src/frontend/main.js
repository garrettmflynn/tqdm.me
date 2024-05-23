import { getBar, discoveryContainer, mainContainer, clearProgress, sortContainersByTimestamp, versionReadout } from './utils/elements.js'

const origin = window.location.origin

// When served on Python server
if (!window.commoners) {
  window.commoners = {
    version: 'dev',
    services: { tqdm: { url:origin } },
    target: 'web'
  }
}

versionReadout.innerText = commoners.version

const BUTTONS = {}

const userId = window.location.pathname.split('/').slice(-1)[0]

if (!userId) mainContainer.insertAdjacentElement('afterbegin', discoveryContainer)

const service = commoners.services.tqdm
const tqdmUrl = new URL(service.url)

let subscribed;

const startWSConnection = async () => {

  const href = tqdmUrl.href

  const socket = io(href);

  const subscribe = (id) => {
    if (subscribed === id) return
    if (subscribed) {
      unsubscribe(subscribed) // Unsubscribe from the previous page
      clearProgress() // Clear the progress bars and containers
    }
    socket.emit('subscribe', id)
    subscribed = id
  }

  const unsubscribe = (id) => socket.emit('unsubscribe', id)

  const createButton = ( userId, pathname ) => {

    if (BUTTONS[userId]) return BUTTONS[userId]

    const button = document.createElement('button')
    button.innerText = userId

    // Subscribe to a specific user ID (only one at a time)
    button.onclick = () => subscribe(userId)

    const div = document.createElement('div')
    div.append(button)

    if (commoners.target === 'desktop') {

      const small = document.createElement('small')
      const a = document.createElement('a')
      a.href = new URL(pathname, origin).href
      a.innerText = 'on your browser'
      a.target = '_blank'
      small.append(document.createTextNode('Or open '), a, document.createTextNode('!'))

      div.append(document.createElement('br'), small)
    }
    

    BUTTONS[userId] = div

    return div
  }

  socket.on('connect', () => {
    if (userId) socket.emit('subscribe', userId) // NOTE: Complete this to start updates
    else socket.emit('discover')
  });

  socket.on('progress', (data) => {
    const { format, ...metadata } = data
    const { update } = getBar(metadata);
    update(data);
  })

  socket.on('init', ({ user_id, states }) => {
    Object.entries(states).map(([ identifier, info ]) => {
      const [ parent, group, id ] = identifier.split('/')
      const { timestamp } = info
      const metadata = { id, parent, group, user_id, timestamp }
      const { update } = getBar(metadata);
      update({ ...info, live: false })
    })

    sortContainersByTimestamp()

  })

  socket.on('users', (data) => discoveryContainer.append(...Object.entries(data).map(([ id, pathname ]) => createButton(id, pathname))));

  socket.on('onadded', ({ id, pathname }) => discoveryContainer.append(createButton(id, pathname)));

  socket.on('onremoved', ({ id }) => {
    BUTTONS[id].remove()
    delete BUTTONS[id]
  });

  socket.on('onstart', ({ id }) => {
    sortContainersByTimestamp()
    console.log('Bar added', id)
  });

  socket.on('onend', ({ id }) => {
    console.log('Bar ended', id)
  });

  socket.on('disconnect', () => {
    console.log('disconnected');
  });
}

if (commoners.target === 'desktop') {
  startWSConnection()
  // service.onActivityDetected(startWSConnection)
  service.onClosed(() => console.error('TQDME Server was closed!'))
}

else startWSConnection()
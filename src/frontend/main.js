import { getBar, labelMap, discoveryContainer, mainContainer, progressContainer } from './utils/elements.js'

// When served on Python server
if (!window.commoners) {
  window.commoners = {
    services: {
      tqdm: { url: 'http://localhost:3768' }
    },
    target: 'web'
  }
}

const BUTTONS = {}

const ids = new Set()

const pageId = window.location.pathname.split('/').slice(-1)[0]

if (!pageId) mainContainer.insertAdjacentElement('afterbegin', discoveryContainer)

const service = commoners.services.tqdm
const tqdmUrl = new URL(service.url)

let subscribed;

const startWSConnection = async () => {

  const href = tqdmUrl.href

  const socket = io(href);

  const subscribe = (id) => {
    if (subscribed !== id) {
      if (subscribed) {
        unsubscribe(subscribed) // Unsubscribe from the previous page
        progressContainer.innerHTML = '' // Clear the progress container
      }
      socket.emit('subscribe', id)
      subscribed = id
    }
  }

  const unsubscribe = (id) => socket.emit('unsubscribe', id)

  const createButton = (pageId, url) => {

    if (BUTTONS[pageId]) return BUTTONS[pageId]

    const button = document.createElement('button')
    button.innerText = labelMap[pageId] || pageId
    button.onclick = () => subscribe(pageId)

    const small = document.createElement('small')
    const a = document.createElement('a')
    a.href = url
    a.innerText = 'on your browser'
    a.target = '_blank'
    small.append(document.createTextNode('Or open '), a, document.createTextNode('!'))

    const div = document.createElement('div')
    div.append(button, document.createElement('br'), small)

    BUTTONS[pageId] = div

    return div
  }

  socket.on('connect', () => {

    if (pageId) {
      socket.emit('subscribe', pageId) // NOTE: Complete this to start updates
    } else {
      socket.emit('discover')
    }
  });

  socket.on('progress', (data) => {
    const { format, ...metadata } = data
    const { update } = getBar(metadata);
    update(data);
  })

  socket.on('init', ({ user_id, states }) => {
    Object.entries(states).map(([ identifier, info ]) => {
      const [ parent, group, id ] = identifier.split('/')
      const metadata = { id, parent, group, user_id }
      const { update } = getBar(metadata);
      update({ ...info, live: false })
    })
  })

  socket.on('users', (data) => discoveryContainer.append(...Object.entries(data).map(([ id, url ]) => createButton(id, url))));

  socket.on('onadded', ({ id, url }) => discoveryContainer.append(createButton(id, url)));
  socket.on('onremoved', ({ id }) => {
    BUTTONS[id].remove()
    delete BUTTONS[id]
  });

  socket.on('onstart', ({ id }) => {
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
  // service.onClosed(() => console.error('TQDM server was closed!'))
}

else startWSConnection()
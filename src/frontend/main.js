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

  const createButton = pageId => {
    const button = document.createElement('button')
    button.innerText = labelMap[pageId] || pageId
    button.onclick = () => subscribe(pageId)
    return button
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
    update(format, metadata);
  })

  socket.on('init', ({ ip, states }) => {
    Object.entries(states).map(([identifier, format]) => {
      const [ppid, pid, id] = identifier.split('/')
      const metadata = { id, ppid, pid, ip }
      const { update } = getBar(metadata);
      update(format, metadata)
    })
  })

  socket.on('ips', (data) => discoveryContainer.append(...data.map(createButton)));

  socket.on('onipadded', (data) => discoveryContainer.append(createButton(data)));

  socket.on('disconnect', () => {
    console.log('disconnected');
  });
}

if (commoners.target === 'desktop') {
  service.onActivityDetected(startWSConnection)
  service.onClosed(() => console.error('TQDM server was closed!'))
}

else startWSConnection()
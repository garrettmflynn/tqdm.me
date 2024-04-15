
const BARS = {} // Track progress bars
const CONTAINERS = {} // Track request containers

export const labelMap = {
    '::1': 'This Device',
}
  

export const mainContainer = document.querySelector('main');
export const progressContainer = document.getElementById('progress')
export const discoveryContainer = document.createElement('div');
discoveryContainer.id = 'discover';

// Create a progress bar and append it to the bar container
export const createProgressBar = (parentElement = progressContainer) => {

    const container = document.createElement('div');
    container.classList.add('bar');

    const row1 = document.createElement('div');
    const row2 = document.createElement('div');

    const element = document.createElement('div');
    element.classList.add('progress');
    const progress = document.createElement('div');

    const readout = document.createElement('small');
    element.append(progress);

    row1.append(element, readout);

    const descriptionEl = document.createElement('small');
    row2.append(descriptionEl);

    container.append(row1, row2);

    parentElement.appendChild(container); // Render the progress bar


    const update = ( format_dict, metadata  = {}) => {

        const { total, n, elapsed, rate, prefix } = format_dict;

        const percent = 100 * (n / total);
        progress.style.width = `${percent}%`

        readout.innerText = `${n} / ${total} (${percent.toFixed(1)}%)`;


        const remaining = rate && total ? (total - n) / rate : 0; // Seconds

        descriptionEl.innerText = `${prefix ? `${prefix} — ` : ''}${elapsed.toFixed(1)}s elapsed, ${remaining.toFixed(1)}s remaining`;
    }


    return {
        element,
        description: descriptionEl,
        progress,
        readout,
        container,
        update
    };
}

const metadataOrder = [ 'ip', 'ppid', 'pid' ]

// Create + render a progress bar
export function getBar ({ id, ...metadata }) {

    if (BARS[id]) return BARS[id];

    const bar = createProgressBar(getContainer(metadata).bars);

    // const { container } = bar;
    // container.setAttribute('data-small', pid !== progress_bar_id); // Add a small style to the progress bar if it is not the main request bar

    return BARS[id] = bar;

}

function createContainer( identifier, label = identifier ) {

    label = labelMap[identifier] || label // Override label with ID default

    const container = document.createElement('div');
    container.id = identifier;
    container.classList.add('progress-container');

    const header = document.createElement('header');

    const firstHeaderContainer = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.innerText = label;

    const description = document.createElement('small');

    firstHeaderContainer.append(h2, description);
    header.append(firstHeaderContainer);

    const barsElement = document.createElement('div');
    barsElement.classList.add('bar-container');

    container.append(header, barsElement);

    return {
        header: h2,
        description,
        bars: barsElement,
        element: container,
        subcontainers: {}
    };

}

export function getContainer(metadata) {

    let identifier;
    const container = metadataOrder.reduce((acc, key) => {
        const value = metadata[key]
        const parentEl = acc === CONTAINERS ? progressContainer : acc.element
        if (acc.subcontainers) acc = acc.subcontainers
        if (!acc[value]) {

            if (identifier) identifier += `/${value}`
            else identifier = value

            const info = acc[value] = createContainer(identifier, `${key}: ${value}`)
            parentEl.append(info.element)
        }
        
        return acc[value]

    }, CONTAINERS)

    return container


}

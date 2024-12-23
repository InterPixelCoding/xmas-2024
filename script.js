// scrollbar animation fix
function animation_collision_logic() {
    document.body.style.overflowY = 'hidden';
    setTimeout(() => {
        document.body.style.overflowY = 'auto';
    }, 2000);
}

const test = true;

async function fetch_data(sheet_name, api_key = "AIzaSyAM07AIfBXXRU0Y8MbpzySSVtCAG3xjHr0", link = "https://docs.google.com/spreadsheets/d/1zjRNYIoJHSVrsQmtPnAIGiT7ER851TkQE9bgxqoL86Q/edit?usp=sharing") {
    try {
        const sheet_id = link.match(/\/d\/(.*?)\//)[1];
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}/values/${sheet_name}!A1:Z1000?key=${api_key}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const headers = data.values[0];
        const rows = data.values.slice(1);

        return rows.map(row => {
            let obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || null;
            });
            return obj;
        });
    } catch (error) {
        throw error;
    }
}

function error() {console.error(error, this)}

function typewriter(el, str, speed, pause, initial_delay, previous_promise = Promise.resolve()) {
    if (str == null) {str = el.textContent;}
    el.style.height = `fit-content`;
    el.textContent = '';
    const outer_container = el.closest('.card-container');
    const segments = str.match(/[^!?.,]+[!?.,]?/g);
    let current_time = initial_delay || 0;

    return previous_promise.then(() => {
        return new Promise((resolve) => {
            segments.forEach((segment, segment_index) => {
                segment.split('').forEach((char, char_index) => {
                    setTimeout(() => {
                        // el.style.height = 'fit-content';
                        el.textContent += char;
                        // el.style.height = `${el.offsetHeight}px`;
                        if (segment_index === segments.length - 1 && char_index === segment.length - 1) {
                            resolve();
                        }
                    }, current_time);
                    current_time += speed;
                });

                const last_char = segment[segment.length - 1];
                if (/[!?.,]/.test(last_char)) {
                    current_time += pause;
                }
            });
        });
    });
}


function activate(el) {el.classList.remove('hidden'); el.classList.add('active');}

function activate_children(container, except) {
    let items = [];
    if(except) {
        items = container.querySelectorAll(`*:not(${except})`);
    } else {
        items = container.childNodes;
    }
    items.forEach(child => {
        child.classList.remove('hidden');
        child.classList.add('active');
    })
}

window.addEventListener("DOMContentLoaded", () => {
    fetch_data("Christmas Cards")
    .then(
        response => {
            if(response !== null) {
                let obj = {};
                let url_arr = window.location.href.split('?=');
                response.forEach(item => {
                    if(item.Key === url_arr[url_arr.length - 1]) {obj = item;}
                })
                if(obj.Name != null) {
                    const container = document.querySelector('.card-container');
                    const button = container.querySelector('button');
                    activate_children(container, 'button');

                    let promise = Promise.resolve();
                    let speed = 1;
                    if(test) {speed = 0.1}
                    promise = typewriter(container.querySelector('h1'), `Dear ${obj.Name},`, 100 * speed, 50, 0, promise);
                    promise = typewriter(container.querySelector('p'), `${obj.Message} I've coded a present for you! Click the button below to start!`, 30 * speed, 75, 0, promise);
                    promise = typewriter(container.querySelector('h3'), null, 100 * speed, 50, 0, promise);
                    promise.then(() => {
                        container.style.animation = 'unset';
                        activate(button);
                        button.addEventListener("click", () => {
                            container.classList.add('hidden');
                            activate(document.querySelector('.interactive-container'));
                        })
                    });
                } else {
                    error();
                }
            } else {
                error();
            }
        }
    )
})




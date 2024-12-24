// scrollbar animation fix
function animation_collision_logic() {
    document.body.style.overflowY = 'hidden';
    setTimeout(() => {
        document.body.style.overflowY = 'auto';
    }, 2000);
}

function el(str, container) {
    str = str.replace(" ", "");
    let arr = [];
    let el = {};

        try {
            arr = str.split(',');
            arr.forEach(function(item, index) {
                if(index === 0) {
                    el = document.createElement(item)
                } else {
                    el.classList.add(item)
                }
            })
        } catch(err) {
            el = document.createElement(str);
        }

    if(container) {container.appendChild(el)}
    return el;
}

const test = true;
const FRAME_RATE = 30;

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

function fix_size(el) {
    el.style.width = el.offsetWidth + "px";
    el.style.height = el.offsetHeight + "px";
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

function glow(glow_no, els=document.querySelectorAll('.glow')) {
    els.forEach(element => {
        const glow_container = el("div, glowing-container", element);
        glow_container.style.width = (element.offsetWidth * 0.9) + "px";
        for(let i = 0; i<glow_no; i++) {
            const glow_el = el("div, glowing-source", glow_container);
            glow_el.style.animation = `glow-move 2s ${i * 25}ms linear infinite`;
            glow_el.style.opacity = ((100 / glow_no) * (glow_no - i)) / 100;
        }
    })
}

glow(15);

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

function card(container, obj) {
    activate_children(container, 'button');
    let promise = Promise.resolve();
    let speed = 1;
    if(test) {speed = 0.02}
    promise = typewriter(container.querySelector('h1'), `Dear ${obj.Name},`, 100 * speed, 50, 0, promise);
    promise = typewriter(container.querySelector('p'), `${obj.Message} I've coded a present for you! Click the button below to start!`, 30 * speed, 75, 0, promise);
    promise = typewriter(container.querySelector('h3'), null, 100 * speed, 50, 0, promise);

    return promise;
}

function press_and_hold(duration, container, video, grow_type, video_paths) {
    let holding = false, elapsed = 0, interval = 100, main_interval = null, previous_elapsed = 0, previous_direction = 'forward';
    const button = el("button,debossed,press-and-hold");
    button.setAttribute("duration", duration);
    button.setAttribute("elapsed", elapsed);
    button.style.setProperty("--shadow-offset", ".25rem");
    button.style.setProperty("--interval", `${interval}ms`);

    return new Promise((resolve) => {
        const update_elapsed = (value) => {
            elapsed = Math.max(0, value);
            let percent = Math.min((elapsed * 100) / duration, 1);
            button.setAttribute("elapsed", percent);
            button.style.setProperty("--elapsed", `${percent * 100}%`);
            if (percent === 1) {
                clearInterval(main_interval);
                main_interval = null;
                resolve("Completed!");
            }
        };

        const observer = new MutationObserver(() => {
            // Empty observer for future usage if necessary
        });

        observer.observe(button, {
            attributes: true,
            attributeFilter: ["elapsed"],
        });

        let previous_elapsed = elapsed;
        let previous_direction = 'forward';

        const handle_intervals = () => {
            if (holding) update_elapsed(elapsed + 1);
            else if (elapsed > 0) update_elapsed(elapsed - 1);

            const video_duration = video ? video.duration : 1000;
            const progress_percentage = elapsed / (duration / 100);
            let current_time = video_duration * progress_percentage;

            let current_direction = 'forward';
            if (elapsed < previous_elapsed) current_direction = 'reverse';

            const threshold = 0.01;
            if (Math.abs(elapsed - previous_elapsed) < threshold) current_direction = previous_direction;

            if (current_direction !== previous_direction && elapsed > 0) {
                if (current_direction === 'forward') {
                    if (video) {
                        video.src = video_paths[0];
                        video.currentTime = Math.max(0, current_time);
                        if (video.currentTime !== video.duration) video.play();
                    }
                } else {
                    const reversed_current_time = video_duration * (1 - progress_percentage);
                    if (video) {
                        video.src = video_paths[1];
                        video.currentTime = reversed_current_time;
                        if (video.currentTime !== video.duration) video.play();
                    }
                }
                previous_direction = current_direction;
            }

            if (elapsed > 0 && holding) {
                if (video && video.paused && video.currentTime < video.duration) video.play();
            }

            if (elapsed === 0 && holding) {
                if (video) {
                    video.src = video_paths[0];
                    video.currentTime = 0;
                    video.play();
                }
                previous_direction = 'forward';
            }

            previous_elapsed = elapsed;
        };

        main_interval = setInterval(() => {
            if (elapsed < duration / 100 || holding) handle_intervals();
        }, interval);

        button.addEventListener("mousedown", () => {
            holding = true;
        });

        button.addEventListener("mouseup", () => {
            holding = false;
        });

        button.addEventListener("mouseleave", () => {
            holding = false;
        });

        const info_span = el("span");
        info_span.textContent = `Press and hold to grow ${grow_type}`;
        const progress = el("div, progress");

        button.appendChild(info_span);
        button.appendChild(progress);
        container.appendChild(button);

        return button;
    });
}

function interactive_experience_main(container) {
    const video = document.querySelector('.interactive-container > video');
    fix_size(video);
    const video_info = [
        {grow_type: "test", duration: 381}
    ]
    let duration = (video_info[0].duration / FRAME_RATE) * 1000;
    press_and_hold(duration, container, video, video_info[0].grow_type, [`./${video_info[0].grow_type}.webm`, `./${video_info[0].grow_type}_reversed.webm`]).then(response => {
        // console.log(response)
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
                    
                    card(container, obj).then(() => {
                        container.style.animation = 'unset';
                        container.scrollTop = container.scrollHeight;
                        fix_size(button);
                        activate(button);
                        button.addEventListener("click", () => {
                            container.classList.add('hidden');
                            document.body.style.setProperty("--dark-col", "#111413");

                            const interactive_container = document.querySelector('.interactive-container');
                            activate(interactive_container);
                            interactive_experience_main(interactive_container);
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




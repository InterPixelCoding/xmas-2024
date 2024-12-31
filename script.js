// Preload videos
function preload_videos(video_info) {
    return video_info.map((video) => {
        const video_el = document.createElement("video");
        video_el.src = `./extracts/${video.file}.webm`;
        video_el.preload = "auto";
        document.body.appendChild(video_el); // Append to body to ensure it's loaded
        video_el.style.display = "none"; // Hide the video element
        return video_el;
    });
}

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

const test = false;

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
                        el.textContent += char;
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
function deactivate(el) {el.classList.add('hidden'); el.classList.remove('active');}

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
    fix_size(container);
    promise = typewriter(container.querySelector('h1'), `Dear ${obj.Name},`, 100 * speed, 50, 0, promise);
    promise = typewriter(container.querySelector('p'), `${obj.Message} I've coded a present for you! Click the button below to start!`, 30 * speed, 75, 0, promise);
    promise = typewriter(container.querySelector('h3'), null, 100 * speed, 50, 0, promise);
    return promise;
}

function press_and_hold(container, video, srcs) {
    let holding = false,
        elapsed = 0,
        interval = 100,
        main_interval = null,
        current_video_index = 0;

    const button = el("button,debossed,press-and-hold");
    button.setAttribute("elapsed", elapsed);
    button.style.setProperty("--shadow-offset", ".25rem");
    button.style.setProperty("--interval", `${interval}ms`);

    const update_button_text = () => {
        const info_span = button.querySelector("span");
        let span_text = srcs[current_video_index].text;
        info_span.textContent = span_text;
    };

    const load_video = () => {
        return new Promise((resolve) => {
            video.src = `./extracts/${srcs[current_video_index].file}.webm`;
            video.addEventListener(
                "loadedmetadata",
                () => {
                    const duration = video.duration;

                    const handle_intervals = () => {
                        if (holding) {
                            const increment = (100 / (duration * 1000)) * interval;
                            update_elapsed(elapsed + increment);
                            if (video.paused) video.play();
                        } else {
                            if (!video.paused) video.pause();
                        }
                    };

                    main_interval = setInterval(handle_intervals, interval);

                    const start_holding = () => (holding = true);
                    const stop_holding = () => (holding = false);

                    // Add support for both mouse and touch events
                    button.addEventListener("mousedown", start_holding);
                    button.addEventListener("touchstart", start_holding, { passive: true });

                    button.addEventListener("mouseup", stop_holding);
                    button.addEventListener("mouseleave", stop_holding);
                    button.addEventListener("touchend", stop_holding, { passive: true });
                    button.addEventListener("touchcancel", stop_holding, { passive: true });
                },
                { once: true }
            );

            const update_elapsed = (value) => {
                elapsed = Math.min(Math.max(0, value), 100);
                button.setAttribute("elapsed", elapsed);
                button.style.setProperty("--elapsed", `${elapsed}%`);
                if (elapsed === 100) {
                    clearInterval(main_interval);
                    main_interval = null;
                    current_video_index++;
                    if (current_video_index < srcs.length) {
                        elapsed = 0;
                        update_elapsed(elapsed);
                        update_button_text();
                        load_video().then(resolve);
                    } else {
                        resolve(); // Resolve when all videos are completed
                    }
                }
            };

            update_elapsed(elapsed); // Initialize elapsed update
        });
    };

    return new Promise((resolve) => {
        const info_span = el("span");
        const progress = el("div, progress");

        button.appendChild(info_span);
        button.appendChild(progress);
        container.appendChild(button);

        update_button_text();
        load_video().then(resolve);
    });
}

function interactive_experience_main(container) {
    const video = document.querySelector('.interactive-container > video');
    let video_info = [
        {file: 'the_trunk', text: 'Press and hold to grow the trunk'},
        {file: 'the_branches', text: 'Press and hold to grow the branches'},
        {file: 'pine_needles', text: 'Press and hold to grow the pine needles'},
        {file: 'randomise', text: 'Randomise!'},
        {file: 'make_it_snow', text: 'Make it snow!'},
    ];
    press_and_hold(container, video, video_info).then(() => {
        deactivate(container);
        document.body.style.setProperty("--dark-col", "#3a2715");
        activate(document.querySelector('.thank-you'))
    });
}

window.addEventListener("DOMContentLoaded", () => {
    let video_info = [
        {file: 'the_trunk', text: 'Press and hold to grow the trunk'},
        {file: 'the_branches', text: 'Press and hold to grow the branches'},
        {file: 'pine_needles', text: 'Press and hold to grow the pine needles'},
        {file: 'randomise', text: 'Randomise!'},
        {file: 'make_it_snow', text: 'Make it snow!'},
    ];

    // Preload videos
    preload_videos(video_info);

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

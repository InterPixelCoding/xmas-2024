const card_arr = document.querySelectorAll('.card > *');

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

fetch_data("Christmas Cards")
.then(
    (response) => {
        if(response !== null) {
            let obj = {};
            response.forEach(item => {
                let url_arr = window.location.href.split('?=');
                if(item.Key === url_arr[url_arr.length - 1]) {obj = item;}
            })
            card_arr[0].textContent = `Dear ${obj.Name},`;
            card_arr[1].textContent = `${obj.Message},`;
            card_arr.forEach( function(el, index) {
                el.classList.add('active')
                el.style.setProperty("--animation-delay", `${index*100}ms`);
            })
        } else {
            card_arr.forEach(el => {el.style.opacity = '1'})
        }
    }
)



//This is some really sloppy code I just slapped together.v

if (document.body.parentElement.id === "XF" && document.body.dataset.template === "forum_view") {
    //The webpage is a forum (XF), and it's on the list screen.
    
    chrome.storage.sync.get(["mode", "blockingOlderThan"], (result) => {
        // # of Elms blocked
        const div = document.getElementById("NoNecro") || document.createElement("div");
        div.id = "NoNecro"
        div.innerHTML = `<b>NoNecro:</b> Blocked <span id="NoNecroNumBlocked" style="font-family: monospace"></span> thread(s). Blocking threads older than `;
        div.style.backgroundColor = "lightgray";
        div.style.color = "black";
        div.style.padding = "15px";
        div.style.border = "1px solid grey";

        const dayInput = document.createElement("input");
        dayInput.setAttribute("type", "number");
        dayInput.min = "0";
        dayInput.max = "99";
        dayInput.value = result.blockingOlderThan || 14;
        dayInput.addEventListener("change", (e) => chrome.storage.sync.set({blockingOlderThan: e.target.value}, block));
        div.appendChild(dayInput);

        div.appendChild(document.createTextNode(" days. "));

        const modeSelect = document.createElement("select");
        const hideOption = document.createElement("option");
        hideOption.value = "Hide";
        hideOption.textContent = "Hide";
        modeSelect.appendChild(hideOption);
        const grayOption = document.createElement("option");
        grayOption.value = "Gray out";
        grayOption.textContent = "Gray out"
        modeSelect.appendChild(grayOption);
        modeSelect.addEventListener("change", (e) => chrome.storage.sync.set({mode: e.target.value}, block));
        modeSelect.value = result.mode || "Hide";

        div.appendChild(modeSelect);
        div.appendChild(document.createTextNode(" blocked threads."))

        document.getElementsByClassName("p-body-pageContent")[0].prepend(div);

        block();
    });
}

function block() {
    const timeEls = document.getElementsByTagName("time");
    let numBlocked = 0;

    chrome.storage.sync.get(["mode", "blockingOlderThan"], (result) => {
        const blockOlderThan = (result.blockingOlderThan || 14) * 86400000;
        for (const timeEl of timeEls) {
            try {
                const threadEl = timeEl.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
    
                if (!threadEl.classList.contains("structItem--thread")) {
                    // Somehow we targeted something that wasn't a thread. Leaving.
                    continue;
                }
                
                threadEl.style.opacity = 1;
                threadEl.style.display = "";

                if (Date.now() - (timeEl.dataset.time * 1000) > blockOlderThan) {
                    numBlocked++;
                    if (result.mode === "Gray out") {
                        threadEl.style.opacity = 0.5;
                    } else {
                        threadEl.style.display = "none";
                    }
                }
            } catch (e) {
                //Just in case one of the elements fails, we don't want the whole extension to quit.
                console.log(e);
            }
        }

        document.getElementById("NoNecroNumBlocked").innerHTML = numBlocked.toString().length === 1 ? `&nbsp;${numBlocked}` : numBlocked;
    });
}
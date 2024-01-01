let rate_indicator
let video_parent
let video
let Qs = []
let timeout;
let timestamps = true
let EditWithNumbers = false
let bar
let counter
let updateHeatmap = false
let alwaysShowHeatmap = false
let secondsSplit
let heatMapChart
let startOffset
let isStartOffset = false
let offsetsArr = []
let continuousStamp
let startPlayDate = new Date()
let totalPlayTime = 0
let canvasDiv


let keyCodeToChar = {
    'w': 87,
    'a': 65,
    's': 83,
    'd': 68,
    'e': 69,
    'q': 81,
    'r': 82,
    'p': 80,
    't': 84,
    ';': 186,
    '/': 191,
    "'": 222,
    '[': 219,
    ']': 221,
    'arrowLeft': 37,
    'arrowRight': 39,
    '1': 49,
    '9': 57,
    ' ': 32
}







chrome.storage.local.get("timestamps", function(items){
    if (items["timestamps"]!=undefined) {
        if (items["timestamps"]) {
            document.querySelector(':root').style.setProperty('--timestamps', '1')
        }
        else {
           document.querySelector(':root').style.setProperty('--secondary-overflow', '0')
        }
        timestamps = items["timestamps"]
    }
    else {
        document.querySelector(':root').style.setProperty('--timestamps', '1')
    }
});
chrome.storage.local.get("EditWithNumbers", function(items){
    if (items["EditWithNumbers"]!=undefined) {
        EditWithNumbers = items["EditWithNumbers"]
    }
});
chrome.storage.local.get("alwaysShowHeatmap", function(items){
    if (items["alwaysShowHeatmap"]!=undefined) {
        alwaysShowHeatmap = items["alwaysShowHeatmap"]
    }
});




document.querySelectorAll("link[rel~='icon']").forEach(link => {link.href = chrome.runtime.getURL("icon.png")});
let wrapper = document.createElement('div');
wrapper.innerHTML=    '<svg width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" style="margin-top: -7rem;">            <defs>          <linearGradient id="MyGradient">        <stop offset="0%" stop-color="rgba(50,94,244,1)" style="    stop-color: hsl(230 90% 58% / 1);"></stop>        <stop offset="25%" stop-color="rgba(50,129,244,1)" style="    /* stop-color: hsl(216 90% 52% / 1); */"></stop>        <stop offset="50%" stop-color=" rgba(50,139,244,1)" style="    stop-color: hsl(210 90% 65% / 1);"></stop>        <stop offset="75%" stop-color=" rgba(50,129,244,1)"></stop>        <stop offset="100%" stop-color="rgb(50, 94, 244)" style="    stop-color: hsl(230 90% 58% / 1);"></stop>        </linearGradient><linearGradient id="MyGradient2">       <stop style="stop-opacity:1;stop-color: hsl(37 100% 47% / 1);" offset="0" id="stop22"></stop>                  <stop style="stop-opacity:1;stop-color: #ffda4e;" offset="0.3" id="stop28"></stop>      <stop style="stop-opacity:1;stop-color: hsl(37 100% 47% / 1);" offset="1" id="stop30"></stop>     </linearGradient>      </defs>                </svg>';
document.body.appendChild(wrapper.firstChild)

// FUNCTIONS
function updateBorderColors(){
    let counterClipped = counter.map(value=>{return Math.min(value/secondsSplit/4, 4)})
    document.querySelectorAll(".timestamps-container:not(.timestamps-container-chapter) h1").forEach((e) => {
        let borderColor = Math.max((120-(counter[Math.round(parseFloat(e.getAttribute("time")) / secondsSplit)] / secondsSplit / 4 / 4) * 120) - 10, 0)
        e.style.borderRight = `2px hsl(${borderColor}deg 80% 50%) solid`
        e.parentElement.style.border = `1px hsl(${borderColor}deg 80% 50%) solid`
    })


    document.querySelectorAll(".timestamps-container-chapter").forEach((e) => {
        let startTimeSeconds = e.querySelector("h1[startTime]").getAttribute("startTime")
        let endTimeSeconds = e.querySelector("h1[endTime]").getAttribute("endTime")
        list = counterClipped.slice(Math.floor(startTimeSeconds/secondsSplit), Math.ceil(endTimeSeconds/secondsSplit))
        let average = list.reduce((prev, curr) => prev + curr) / list.length;
        let borderColor = Math.max((120-(average / 4) * 120) - 10, 0)
        e.querySelector("h1[endTime]").style.borderRight = `2px hsl(${borderColor}deg 80% 50%) solid`
        e.style.border = `1px hsl(${borderColor}deg 80% 50%) solid`
    })
}


function addContinuousTimeStamp(e, startTime, endTime) {
    // let borderColor = Math.max((120-(counter[Math.round(video.currentTime / secondsSplit)] / secondsSplit / 4 / 4) * 120) - 10, 0) // change to average
    let counterClipped = counter.map(value=>{return Math.min(value/secondsSplit/4, 4)})
    list = counterClipped.slice(Math.floor(startTime/secondsSplit), Math.ceil(endTime/secondsSplit))
    let average = list.reduce((prev, curr) => prev + curr) / list.length;
    let borderColor = Math.max((120-(average / 4) * 120) - 10, 0)


    let h1 = document.createElement("h1")
    let h1Second = document.createElement("h1")
    let h1Divider = document.createElement("h1")
    h1Divider.innerHTML = "-"
    h1Divider.style = 'margin-right: -0.6rem;color: rgb(255 255 255 / 90%);padding: 0px 6px 0px 3px;cursor: pointer;display: inline-block;margin-top: -0.5rem !important;text-shadow: rgb(255 255 255) 0px 0px 6px !important;'
    h1.style = `margin-right: -0.3rem;color: hsl(210 100% 64% / 1);background-color: transparent;width: fit-content;padding: 2px 4px 4px 4px;cursor: pointer;margin-bottom: -0.5rem !important;margin-top: -0.5rem !important;display: inline-block;text-shadow: rgb(3, 169, 244) 0px 0px 7px !important;padding-left:4px;border-bottom-left-radius:0.5rem;border-top-left-radius:0.5rem`
    h1Second.style = `border-right: 2px solid hsl(${borderColor}deg 80% 50%);margin-right: -0.6rem;color: hsl(210 100% 64% / 1);background-color: transparent;width: fit-content;padding: 2px 4px 4px 4px;cursor: pointer;margin-bottom: -0.5rem !important;margin-top: -0.5rem !important;display: inline-block;text-shadow: rgb(3, 169, 244) 0px 0px 7px !important;padding-left:4px;border-bottom-left-radius:0.5rem;border-top-left-radius:0.5rem`
    h1.setAttribute("startTime", startTime)
    h1.setAttribute("time", startTime)
    h1Second.setAttribute("endTime", endTime)
    // h1Second.setAttribute("time", endTime)
    h1.innerHTML = msToHours(startTime) // change to start end
    h1Second.innerHTML = msToHours(endTime) // change to start end
    h1.onclick = (e) => {
        video.currentTime = (e.target.getAttribute("startTime"))
        e.target.style.setProperty("transition", "color 30ms linear 0s, text-color 30ms linear 0s, transform ease-out 80ms");
        e.target.style.setProperty("color", "hsl(210 100% 100% / 1)", "important");
        e.target.style.setProperty("textShadow", "hsl(210 100% 100% / 1) 0px 0px 7px", "important");
        e.target.style.setProperty("transform", "scale(1.1)", "important");
        e.target.style.setProperty("padding", "1px 4px 2px 4px", "important");
        setTimeout(() => {
            e.target.style.setProperty("transition", "color 700ms cubic-bezier(0.43, 0, 0, 1) 0s, text-color 700ms cubic-bezier(0.43, 0, 0, 1) 0s, transform cubic-bezier(0.43, 0, 0, 1) 300ms");
            e.target.style.setProperty("color", "rgb(71, 163, 255)");
            e.target.style.setProperty("textShadow", "rgb(3, 169, 244) 0px 0px 7px");
            e.target.style.setProperty("transform", "scale(1)", "important");
        }, 100)
        setTimeout(() => {
            e.target.style.setProperty("padding", "2px 4px 4px 4px", "important");
        }, 200);
    }
    h1Second.onclick = (e) => {
        video.currentTime = (e.target.getAttribute("endTime"))
        e.target.style.setProperty("transition", "color 30ms linear 0s, text-color 30ms linear 0s, transform ease-out 80ms");
        e.target.style.setProperty("color", "hsl(210 100% 100% / 1)", "important");
        e.target.style.setProperty("textShadow", "hsl(210 100% 100% / 1) 0px 0px 7px", "important");
        e.target.style.setProperty("transform", "scale(1.1)", "important");
        e.target.style.setProperty("padding", "1px 4px 2px 4px", "important");
        setTimeout(() => {
            e.target.style.setProperty("transition", "color 700ms cubic-bezier(0.43, 0, 0, 1) 0s, text-color 700ms cubic-bezier(0.43, 0, 0, 1) 0s, transform cubic-bezier(0.43, 0, 0, 1) 300ms");
            e.target.style.setProperty("color", "rgb(71, 163, 255)");
            e.target.style.setProperty("textShadow", "rgb(3, 169, 244) 0px 0px 7px");
            e.target.style.setProperty("transform", "scale(1)", "important");
        }, 100)
        setTimeout(() => {
            e.target.style.setProperty("padding", "2px 4px 4px 4px", "important");
        }, 200);
    }

    input = document.createElement("input")
    input.setAttribute("time", startTime)
    input.style = 'min-width: 1rem;font-size: 150%; border: 1px solid wheat; border-radius: 0.4rem; padding: 0.2rem; margin-right: 0.3rem; top: -0.2rem; position: relative; width: 1ch;box-shadow:rgb(255, 255, 255) 0px 0px 20px -8px !important;max-width: 75%'
    input.dir = "auto"
    input.style.width = getWidthOfInput(input) + "px"
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.target.blur()
        }
    });
    input.oninput = (e) => {tryAdjustInput(e.target)}
    input.addEventListener("click", function() {
        if (!isNaN(this.value) || this.value===''){
            this.setSelectionRange(0, this.value.length)
        }
    });
    svg = document.createElement("svg")
    svg.setAttribute("time", startTime)
    svg.innerHTML = '<svg viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="90px" height="70px" style="filter: drop-shadow(0px 0px 2px red);width: 40px;fill: hsl(0 70% 50% / 1);transform-origin: right bottom;transition: transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1);stroke: white;margin-right: -1rem;height: 73px;margin-top: -5.4rem !important;transform: translate(2px,36px) scale(0.9) !important;"><g style="cursor: pointer"> <path d="M20.5001 6H3.5 M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" style="fill: hsl(0 70% 50% / 1);cursor: pointer;transform-origin: right bottom;transition: transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1);transform: translate(0px, 1px);stroke: white;" id="move_path"></path> <path d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" style="    fill: hsl(0 70% 50% / 1);    cursor: pointer;    stroke: white;"></path> <path d="M9.5 11L10 16" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" style="    stroke: white;"></path> <path d="M14.5 11L14 16" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" style="    stroke: white;"></path>  </g></svg>'
    svg.setAttribute("time", startTime)
    br = document.createElement("br")
    br.setAttribute("time", startTime)
    container = document.createElement("div")
    container.classList.add("timestamps-container")
    container.classList.add("timestamps-container-chapter")
    container.style.border = `1px hsl(${borderColor}deg 80% 50%) solid`
    document.querySelector("#secondary").insertBefore(container, document.querySelector("#secondary-inner"));
    // document.querySelector("#secondary").prepend(container)
    container.appendChild(svg)
    container.appendChild(h1Second)
    container.appendChild(h1Divider)
    container.appendChild(h1)
    container.appendChild(input)   
    container.appendChild(br)
    svg.firstChild.firstChild.onclick = (e) => {
        let timeAttribute = e.target.parentElement.parentElement.parentElement.getAttribute("time")
        let continuousTimeStamp = document.querySelector(`.__youtube-timestamps__stamp__chapter[startTime="${timeAttribute}"]`)

        continuousTimeStamp.style.animation = "scale-to-0 200ms ease-in-out forwards"
        setTimeout(() => {
            continuousTimeStamp.remove()
        }, 200);

        secondaryCoolDownClick  = true
        clearTimeout(secondaryCoolDownTimeOut);
        secondaryCoolDownTimeOut = setTimeout(() => {
            secondaryCoolDownClick = false
        }, 300);

        // let timestampsContainer = document.querySelector(`.timestamps-container:has([time='${startTime}'])`)

        removeContinuousTimestamp(timeAttribute)
    }
    let secondary = document.querySelector("#secondary")
    secondary.oncontextmenu = () => {return false}
    secondary.onmousedown = (e) => {
        if (e.button === 2) {
            if (e.target.id!="secondary") return;
            EditWithNumbers = !EditWithNumbers
            chrome.storage.local.set({ "EditWithNumbers": EditWithNumbers });
            onOff = EditWithNumbers ? 'On' : 'Off'
            console.log("Edit With Numbers Is Now " + onOff)
        }
    }
    secondary.addEventListener("click", secondaryOnClick);
    if (e.shiftKey) {
        e.preventDefault();
        input.value = '';
        input.focus()
        return
    }
    else if (e.ctrlKey && document.querySelector(".captions-text") != undefined) {
        input.value = document.querySelector(".captions-text").innerText.replaceAll("\n", " ");
    }

    setTimeout(() => {
        adjustInputsWidth()
    }, 300);




}


function addContinuousTimeStampBar(e) {
    e.preventDefault()
    e.stopPropagation()
    if (isStartOffset) {
        let endOffset = video.currentTime / video.duration * 100
        let width
        let flipped = false
        if (endOffset == startOffset) return
        else if (endOffset < startOffset) {
            [startOffset, endOffset] = [endOffset, startOffset]; // flip again if not valid
            flipped = true
            // console.log("flipped")
        }
        width = endOffset - startOffset
        offsetsArr.push([startOffset, endOffset])


        let intersections = 0, i = 0;
        offsetsArr.sort(function (a, b) {
            return a[0] - b[0];
        });
        // console.log("after push", ...offsetsArr)
        // console.log("endoffset")
        // console.log("startOffset", startOffset)
        // console.log("endOffset", endOffset)
        for (i = 1; i < offsetsArr.length; i++) {
            if (offsetsArr[i][0] < offsetsArr[i - 1][1]) {
                intersections++;
            }
        }
        if (intersections > 0) {
            offsetsArr.splice(offsetsArr.findIndex((arr) => JSON.stringify(arr) == JSON.stringify([startOffset, endOffset])), 1);
            if (flipped) {
                [startOffset, endOffset] = [endOffset, startOffset]; // flip again if not valid
            }
            // console.log("after pop", ...offsetsArr)
            return
        }
        continuousStamp.style.width = `calc(${width}% + 2px)`
        continuousStamp.setAttribute("startOffset", startOffset)
        continuousStamp.setAttribute("endOffset", endOffset)
        continuousStamp.style.left = `calc(${startOffset}% - 2px)`
        continuousStamp.style.animation = 'none' // added
        continuousStamp.setAttribute("startTime", startOffset * video.duration / 100)
        continuousStamp.setAttribute("endTime", endOffset * video.duration / 100)
        isStartOffset = false
        addContinuousTimeStamp(e, startOffset * video.duration / 100, endOffset * video.duration / 100)

    }
    else {
        // console.log("startoffset")
        startOffset = video.currentTime / video.duration * 100
        // console.log(startOffset, offsetsArr)
        for (let i = 0; i < offsetsArr.length; i++) {
            if ((startOffset >= offsetsArr[i][0] && startOffset <= offsetsArr[i][1])) {
                // console.log("already occupied")
                return
            }
        }
        isStartOffset = true

        continuousStamp = document.createElement('div')
        continuousStamp.classList.add('__youtube-timestamps__stamp')
        continuousStamp.classList.add('__youtube-timestamps__stamp__chapter')
        offset = video.currentTime / video.duration * 100
        continuousStamp.style.left = `calc(${startOffset}% - 2px)`
        continuousStamp.style.maxWidth = "100%"
        continuousStamp.style.width = `2px`
        continuousStamp.style.borderRadius = "0"
        continuousStamp.style.top = "-1px"
        continuousStamp.style.backgroundColor = "hsl(60deg 100% 50% / 80%)"
        continuousStamp.style.animation = 'scale-anim 1000ms infinite' // change
        continuousStamp.onmousedown = (e) => {
            if (e.button === 2) {
                document.querySelector(':root').style.setProperty('--ytp-contextmenu-display', 'none')
                e.target.style.animation = "scale-to-0 200ms ease-in-out forwards"
                setTimeout(() => {
                    if (e.target.getAttribute("endTime")){
                        removeContinuousTimestamp(e.target.getAttribute("startTime"))
                        
                    }
                    else{
                        console.log("resetting")
                        isStartOffset = false
                    }
                    // e.target.remove()
                    document.querySelector(':root').style.setProperty('--ytp-contextmenu-display', '')
                }, 200);
            }
        }
        bar = getOrCreateBar()
        document.querySelector(".__youtube-timestamps__bar").oncontextmenu = () => { return false }
        bar.appendChild(continuousStamp)

    }
}

function addHeatMap() {
    // const secondsSplit = 5
    secondsSplit = Math.ceil(Math.sqrt(video.duration)/4)
    console.log(secondsSplit, "secondsSplit")
    // if (video.duration / 60 < 45){
    //     secondsSplit = 5
    // }
    // else{
    //     secondsSplit = 15
    // }
    const tickSpeed = 4
    const maxTimesWatched = 4
    counter = new Array(Math.ceil(video.duration / secondsSplit)+1).fill(0);
    document.querySelector(".ytp-progress-bar").oncontextmenu = () => {return false}
    document.querySelector(".ytp-progress-bar-container").oncontextmenu = () => {return false}

    video.ontimeupdate = (e) => {        
        if (video.paused) return
        // console.time('ontimeupdate'); //added
        
        let currentTimeFloor = Math.floor(video.currentTime / secondsSplit)
        let currentTimeCeil = Math.ceil(video.currentTime / secondsSplit)
        counter[currentTimeFloor] += video.playbackRate / 2;
        counter[currentTimeCeil] += video.playbackRate / 2;
        // let newSuggestedMax = maxTimesWatched // Math.max(...counter)/(secondsSplit*tickSpeed) + 1
        // if (newSuggestedMax == 1){
        //     newSuggestedMax = 2
        // }
        heatMapChart.data.labels = Array.from(Array(counter.length).keys()).map(String)
        heatMapChart.data.datasets[0].data = counter.map(value=>{return value/(secondsSplit*tickSpeed)}).map(value => value > maxTimesWatched-0.2? maxTimesWatched-0.2:value)

        // check of meed dynamic: 90% video is one watch 10% is double watch no triple watch todo option to activate dynamic

        updateBorderColors()


  
        if (updateHeatmap){
            heatMapChart.update();
        }
        // console.timeEnd('ontimeupdate') //added
    }

    if (canvasDiv) {return}
    canvasDiv = document.createElement("div")
    canvasDiv.style.pointerEvents = "none"
    canvasDiv.style.position = "relative"
    canvasDiv.style.top = "-7.95rem"
    canvasDiv.style.left = "-1.3%"
    canvasDiv.style.width = "98.5%"
    canvasDiv.style.marginTop = "-6rem"
    canvasDiv.style.transition = "opacity 200ms ease 0s"
    canvasDiv.id = "canvas-div"
    canvasDiv.innerHTML = '<canvas id="heatmap-chart" style="width: 100%;height:6rem;position:relative;" class="chartjs-render-monitor"></canvas>'    
    // document.querySelector("#above-the-fold").prepend(canvasDiv)
    document.querySelector("#top-row").parentElement.insertBefore(canvasDiv, document.querySelector("#top-row"))


    // video.onpause = () => {heatMapChart.update()}
    let observer = new MutationObserver(mutations => {
        if (!alwaysShowHeatmap) return
        if (document.querySelector("#movie_player").classList.contains("ytp-autohide")) {
            updateHeatmap = false
            canvasDiv.style.opacity = "0"
        }
        else {
            heatMapChart.update();
            canvasDiv.style.opacity = "1"
            updateHeatmap = true
        }
    });
    observer.observe(document.querySelector("#movie_player"), {
        attributes: true,
        attributeFilter: ["class"]
    });

    

    document.querySelector(".ytp-progress-bar").onmouseenter = () =>{
        if (alwaysShowHeatmap) return
        heatMapChart.update();
        canvasDiv.style.opacity = "1"
        updateHeatmap = true
    }
    document.querySelector(".ytp-progress-bar").onmouseleave = () =>{
        if (alwaysShowHeatmap) return
        canvasDiv.style.opacity = "0"
        updateHeatmap = false
    }
    let canvas = document.getElementById('heatmap-chart')
    let ctx = canvas.getContext("2d");
    let gradientStroke = ctx.createLinearGradient(0, canvas.scrollHeight, 0, 0);
    // gradientStroke.addColorStop(0, 'hsl(120 80% 50% / 0.6)');    
    gradientStroke.addColorStop(0.5, 'hsl(60 80% 50% / 0.6)');
    gradientStroke.addColorStop(0.8, 'hsl(0 80% 50% / 0.6)');
    gradientStroke.addColorStop(0, 'transparent');
    gradientStroke.addColorStop(0.22, 'transparent');
    gradientStroke.addColorStop(0.22, 'hsl(120 80% 50% / 0.6)');
    

    
    const data = {
      labels: Array.from(Array(counter.length + 1).keys()).map(String),
      datasets: [{
        borderWidth: 2,
        backgroundColor: gradientStroke,
        borderColor: gradientStroke,
        pointBorderColor: gradientStroke,
        pointBackgroundColor: gradientStroke,
        pointHoverBackgroundColor: gradientStroke,
        pointHoverBorderColor: gradientStroke,
        label: 'Heat Map',
        data: counter,
        fill: true,
        tension: 0.5,
        pointRadius: 0,
        pointHoverRadius: 10,
      }]
    };
    const config = {
        maintainAspectRatio: false,
        responsive: true,
        type: 'line',
        legend: {
            display: false
        },
        tooltips: {
            enabled: false
        },
        data: data,
        scales: {
            xAxes: [{
                display: true,
                ticks: {
                    display: false,
                    fontColor: 'rgba(255,255,255,0.6)',
                    fontSize: 9,
                    beginAtZero: true,
                    // userCallback: function (value, index, values) {
                    //     const time = new Date(value * secondsSplit * 1000).toISOString().slice(11, 19)
                    //     if (time.charAt(0) === "0" && time.charAt(1) === "0") return time.slice(3)
                    //     return time
                    // }
                },
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                display: true,
                ticks: {
                    display: false,
                    fontColor: 'rgba(255,255,255,0.6)',
                    beginAtZero: true,
                    // suggestedMax: 1,
                    max: 4,
                    // userCallback: function (label, index, labels) {
                        // if (Math.floor(label) === label) {
                            // return label;
                        // }
                    // }
                },
                gridLines: {
                    display: false
                }
            }]
        }
    };
    
    heatMapChart = new Chart("heatmap-chart", {
      type: "line",
      data:data,
      options: config
    });
}
function msToHours(seconds){
    const ms = seconds * 1000
    const time = new Date(ms).toISOString().slice(11, 19)
    if (time.charAt(0) === "0" && time.charAt(1) === "0") return time.slice(3)
    else return time
}
function getCurrentTime(){
    const ms = video.currentTime * 1000;
    const time = new Date(ms).toISOString().slice(11, 19)
    if (time.charAt(0) === "0" && time.charAt(1) === "0") return time.slice(3)
    else return time
}
async function addTimeStamp(e, timestampsContainerAnimation, isContinuous){    
    if (Qs.includes(video.currentTime)) return;
    Qs.push(video.currentTime)
    console.log(
        `%c${getCurrentTime()}`,
        ` color:cyan; background-color:black; border-left: 1px solid yellow; padding: 1px;`
    );
    stamp = document.createElement('div')
    stamp.classList.add('__youtube-timestamps__stamp')
    offset = video.currentTime / video.duration * 100
    stamp.style.left = `calc(${offset}% - 2px)`
    stamp.style.top = "-1px"
    stamp.setAttribute("time", video.currentTime)
    stamp.onmouseenter = () => {document.querySelector(".ytp-progress-bar").style.pointerEvents = "none"}
    stamp.onmouseleave = () => {setTimeout(() => {document.querySelector(".ytp-progress-bar").style.pointerEvents = ""}, 25)}
    stamp.onclick = (e) => {document.querySelector(`h1[time="${e.target.getAttribute("time")}"]`).click()}
    stamp.onmousedown = (e) => {
        if (e.button === 2) {
            document.querySelector(':root').style.setProperty('--ytp-contextmenu-display', 'none')
            document.querySelector(`.__youtube-timestamps__stamp[time="${e.target.getAttribute("time")}"]`).style.animation = "scale-to-0 200ms ease-in-out forwards"
            setTimeout(() => {
                removeTimestamp(e.target.getAttribute("time"))
                document.querySelector(':root').style.setProperty('--ytp-contextmenu-display', '')
            }, 200);
        }
    }
    bar = getOrCreateBar()
    document.querySelector(".__youtube-timestamps__bar").oncontextmenu = () => {return false}
    bar.appendChild(stamp)
    let borderColor = Math.max((120-(counter[Math.round(video.currentTime / secondsSplit)] / secondsSplit / 4 / 4) * 120) - 10, 0)
    let h1 = document.createElement("h1")
    h1.style = `margin-right: -0.3rem;color: hsl(210 100% 64% / 1);background-color: transparent;width: fit-content;border-right: 2px solid hsl(${borderColor}deg 80% 50%);padding: 2px 4px 4px 4px;cursor: pointer;margin-bottom: -0.5rem !important;margin-top: -0.5rem !important;display: inline-block;text-shadow: rgb(3, 169, 244) 0px 0px 7px !important;padding-left:4px;border-bottom-left-radius:0.5rem;border-top-left-radius:0.5rem`
    h1.setAttribute("time", video.currentTime)
    h1.innerHTML = getCurrentTime()
    h1.onclick = (e) => {
        video.currentTime = (e.target.getAttribute("time"))
        e.target.style.setProperty("transition", "color 30ms linear 0s, text-color 30ms linear 0s, transform ease-out 80ms");
        e.target.style.setProperty("color", "hsl(210 100% 100% / 1)", "important");
        e.target.style.setProperty("textShadow", "hsl(210 100% 100% / 1) 0px 0px 7px", "important");
        e.target.style.setProperty("transform", "scale(1.1)", "important");
        e.target.style.setProperty("padding", "1px 4px 2px 4px", "important");

        setTimeout(() => {
            e.target.style.setProperty("transition", "color 700ms cubic-bezier(0.43, 0, 0, 1) 0s, text-color 700ms cubic-bezier(0.43, 0, 0, 1) 0s, transform cubic-bezier(0.43, 0, 0, 1) 300ms");
            e.target.style.setProperty("color", "rgb(71, 163, 255)");
            e.target.style.setProperty("textShadow", "rgb(3, 169, 244) 0px 0px 7px");
            e.target.style.setProperty("transform", "scale(1)", "important");
        }, 100)
        setTimeout(() => {
            e.target.style.setProperty("padding", "2px 4px 4px 4px", "important");
        }, 200);
    }
    input = document.createElement("input")
    input.setAttribute("time", video.currentTime)
    input.style = 'min-width: 1rem;font-size: 150%; border: 1px solid wheat; border-radius: 0.4rem; padding: 0.2rem; margin-right: 0.3rem; top: -0.2rem; position: relative; width: 1ch;box-shadow:rgb(255, 255, 255) 0px 0px 20px -8px !important;max-width: 75%'
    input.dir = "auto"
    input.style.width = getWidthOfInput(input) + "px"
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.target.blur()
        }
    });
    input.oninput = (e) => {tryAdjustInput(e.target)}
    input.addEventListener("click", function() {
        if (!isNaN(this.value) || this.value===''){
            this.setSelectionRange(0, this.value.length)
        }
    });
    svg = document.createElement("svg")
    svg.setAttribute("time", video.currentTime)
    svg.innerHTML = '<svg viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="90px" height="70px" style="filter: drop-shadow(0px 0px 2px red);width: 40px;fill: hsl(0 70% 50% / 1);transform-origin: right bottom;transition: transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1);stroke: white;margin-right: -1rem;height: 73px;margin-top: -5.4rem !important;transform: translate(2px,36px) scale(0.9) !important;"><g style="cursor: pointer"> <path d="M20.5001 6H3.5 M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" style="fill: hsl(0 70% 50% / 1);cursor: pointer;transform-origin: right bottom;transition: transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1);transform: translate(0px, 1px);stroke: white;" id="move_path"></path> <path d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" style="    fill: hsl(0 70% 50% / 1);    cursor: pointer;    stroke: white;"></path> <path d="M9.5 11L10 16" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" style="    stroke: white;"></path> <path d="M14.5 11L14 16" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" style="    stroke: white;"></path>  </g></svg>'
    svg.setAttribute("time", video.currentTime)
    br = document.createElement("br")
    br.setAttribute("time", video.currentTime)
    container = document.createElement("div")
    container.classList.add("timestamps-container")
    container.style.border = `1px hsl(${borderColor}deg 80% 50%) solid`

    if (timestampsContainerAnimation != undefined){
        container.style.animation = timestampsContainerAnimation
    }
    document.querySelector("#secondary").insertBefore(container, document.querySelector("#secondary-inner"));
    // document.querySelector("#secondary").prepend(container)
    container.appendChild(svg)
    container.appendChild(h1)
    container.appendChild(input)   
    container.appendChild(br)
    svg.firstChild.firstChild.onclick = (e) => {
        secondaryCoolDownClick  = true
        clearTimeout(secondaryCoolDownTimeOut);
        secondaryCoolDownTimeOut = setTimeout(() => {
            secondaryCoolDownClick = false
        }, 300);
        let timeAttribute = e.target.parentElement.parentElement.parentElement.getAttribute("time")
        removeTimestamp(timeAttribute)
    }
    let secondary = document.querySelector("#secondary")
    secondary.oncontextmenu = () => {return false}
    secondary.onmousedown = (e) => {
        if (e.button === 2) {
            if (e.target.id!="secondary") return;
            EditWithNumbers = !EditWithNumbers
            chrome.storage.local.set({ "EditWithNumbers": EditWithNumbers });
            onOff = EditWithNumbers ? 'On' : 'Off'
            console.log("Edit With Numbers Is Now " + onOff)
        }
    }
    secondary.addEventListener("click", secondaryOnClick);
    if (e.shiftKey) {
        e.preventDefault();
        input.value = '';
        input.focus()
        return
    }
    else if (e.ctrlKey && document.querySelector(".captions-text") != undefined) {
        input.value = document.querySelector(".captions-text").innerText.replaceAll("\n", " ");
    }
    if (timestampsContainerAnimation != undefined) {
        adjustInputsWidth()
    }
    else {
        setTimeout(() => {
            adjustInputsWidth()
        }, 300);
    }

    
}
async function removeContinuousTimestamp(startTime){
    let continuousTimeStamp = document.querySelector(`.__youtube-timestamps__stamp__chapter[startTime="${startTime}"]`)
    // console.log(continuousStamp)
    let startOffset = continuousTimeStamp.getAttribute("startOffset")
    let endOffset = continuousTimeStamp.getAttribute("endOffset")
    let endTime = continuousTimeStamp.getAttribute("endTime")
    // console.log(startTime, endTime)
    // console.log(...offsetsArr)
    continuousTimeStamp.style.animation = "scale-to-0 200ms ease-in-out forwards"
    let timestampsContainer = document.querySelector(`.timestamps-container:has([time='${startTime}'])`)
    timestampsContainer.style.animation = "scale-to-0 200ms ease-in-out forwards"
    
    await new Promise(r => setTimeout(r, 200));
    // console.log(offsetsArr.findIndex((arr) => JSON.stringify(arr) == JSON.stringify([parseFloat(startOffset), parseFloat(endOffset)])))
    offsetsArr.splice(offsetsArr.findIndex((arr) => JSON.stringify(arr) == JSON.stringify([parseFloat(startOffset), parseFloat(endOffset)])), 1);
    document.querySelectorAll(`[time="${startTime}"]`).forEach((e)=>{e.remove()})
    document.querySelectorAll(`[endTime="${endTime}"]`).forEach((e)=>{e.remove()})
    document.querySelectorAll(".timestamps-container:not(:has([time]))").forEach((e)=>{e.remove()})
    adjustInputsWidthForDelete()
}
async function removeTimestamp(timeAttribute, animation){
    let timestampsContainer = document.querySelector(`.timestamps-container:has([time='${timeAttribute}'])`)
    if (animation != undefined) {
        timestampsContainer.style.animation = animation
    }
    else {
        timestampsContainer.style.animation = "scale-to-0 200ms ease-in-out forwards"
        await new Promise(r => setTimeout(r, 200));
    }
    document.querySelectorAll(`[time="${timeAttribute}"]`).forEach((e)=>{e.remove()})
    document.querySelectorAll(".timestamps-container:not(:has([time]))").forEach((e)=>{e.remove()})
    Qs = Qs.filter(function(item) {
        return item !== parseFloat(timeAttribute)
    })
    adjustInputsWidthForDelete()
}
let secondaryCoolDownClick = false
let secondaryCoolDownTimeOut

function secondaryOnClick(e) {
    if (secondaryCoolDownClick){
        return
    }
    if (e!=undefined && e.target.id!="secondary" && !e.target.classList.contains("timestamps-container")) return;
    else if (timestamps) {
       timestamps = false
       chrome.storage.local.set({ "timestamps": false });
       document.querySelector(':root').style.setProperty('--timestamps', '0')
       setTimeout(() => {document.querySelector(':root').style.setProperty('--secondary-overflow', '0')}, 200)
   }
    else {
       timestamps = true
       chrome.storage.local.set({ "timestamps": true});
       document.querySelector(':root').style.setProperty('--timestamps', '1')
       document.querySelector(':root').style.setProperty('--secondary-overflow', '1')
   }

}
function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
function getOrCreateBar() {
    let bar = document.querySelector('.__youtube-timestamps__bar')
    if (!bar) {
        let container = document.querySelector('#movie_player .ytp-timed-markers-container')
        if (!container) {
            container = document.querySelector('#movie_player .ytp-progress-list')
        }
        if (!container) {
            return null
        }
        bar = document.createElement('div')
        bar.classList.add('__youtube-timestamps__bar')
        container.prepend(bar)
    }
    return bar
}
 function getWidthOfInput(input) {
    let tmp = document.createElement("span");
    tmp.style.fontSize = input.style.fontSize
    tmp.className = "input-element tmp-element";
    let endSpaces = 0
    if (/\s+$/.exec(input.value)!=null){
        endSpaces = /\s+$/.exec(input.value)[0].length
    }
    tmp.innerHTML = input.value;
    document.body.appendChild(tmp);
    let theWidth = tmp.getBoundingClientRect().width + endSpaces * 4;
    document.body.removeChild(tmp);
    return theWidth;
}

function adjustInputsWidth(){
    // let inputs = document.querySelectorAll("input[time]")
    // let valueNum = 1
    // for (let i = 0; i < inputs.length; i++){
    //     if (!isNaN(inputs[i].value.replace("-", "")) || inputs[i].value.replace("-", "")===''){
    //         if (inputs[i].parentElement.classList.contains("timestamps-container-chapter")){
    //             inputs[i].value = `${valueNum}-${valueNum+1}`
    //             inputs[i].style.width = `${valueNum}-${valueNum+1}`.length * 8.5 + "px"
    //             valueNum += 2;
    //         }
    //         else{
    //             inputs[i].value = valueNum
    //             inputs[i].style.width = String(valueNum).length * 8.5 + "px"
    //             valueNum++
    //         }
    //     }
    //     else {
    //         tryAdjustInput(inputs[i])
    //     }   
    // }

    document.querySelectorAll("input[time]").forEach(
        function (inputEl, index) {
            if (!isNaN(inputEl.value) || inputEl.value===''){
                inputEl.value = index + 1
                inputEl.style.width = String(index+1).length * 8.5 + "px"
            }
            else {
                tryAdjustInput(inputEl)
            }
        }
    )


}
function adjustInputsWidthForDelete(){
    // let inputs = document.querySelectorAll("input[time]")
    // let valueNum = 1
    // for (let i = 0; i < inputs.length; i++){
    //     if (!isNaN(inputs[i].value.replace("-", "")) || inputs[i].value.replace("-", "")===''){
    //         if (inputs[i].parentElement.classList.contains("timestamps-container-chapter")){
    //             inputs[i].value = `${valueNum}-${valueNum+1}`
    //             inputs[i].style.width = `${valueNum}-${valueNum+1}`.length * 8.5 + "px"
    //             valueNum += 2;
    //         }
    //         else{
    //             inputs[i].value = valueNum
    //             inputs[i].style.width = String(valueNum).length * 8.5 + "px"
    //             valueNum++
    //         }
    //     }  
    // }

    
    document.querySelectorAll("input[time]").forEach(
        function (inputEl, index) {
            if (!isNaN(inputEl.value) || inputEl.value===''){
                inputEl.value = index + 1
                inputEl.style.width = getWidthOfInput(inputEl) + "px"
            }
        }
    )
}

function tryAdjustInput(input){
    input.style.fontSize = "150%"
    input.style.width = getWidthOfInput(input) + "px"
    // while ((secondary.scrollWidth > secondary.clientWidth) && parseInt(input.style.fontSize)>100){
    //     input.style.fontSize = (parseInt(input.style.fontSize) - 1) + "%"
    //     input.style.width = getWidthOfInput(input) + "px"
    // }


    while ((parseInt(input.style.width) > input.clientWidth) && parseInt(input.style.fontSize) > 100) {
        input.style.fontSize = (parseInt(input.style.fontSize) - 1) + "%"
        input.style.width = getWidthOfInput(input) + "px"
    }
    // while ((input.offsetLeft - (secondary.offsetWidth - secondary.clientWidth)) <= 0 && parseInt(input.style.fontSize) > 100) {
    //     input.style.fontSize = (parseInt(input.style.fontSize) - 1) + "%"
    //     input.style.width = getWidthOfInput(input) + "px"
    // }
    
    // if ((input.offsetLeft - (secondary.offsetWidth - secondary.clientWidth)) <= 0) {
    //     input.style.width = `calc(100% + var(--ytd-margin-6x))`
    // }
}


async function change_rate_indicator() {
    // if (stopOnce){
    //     stopOnce = false
    //     return
    // }
    if (document.querySelector('.ytp-speedmaster-user-edu:not([style*="display: none"])')!=undefined) {return}
    rate_indicator.textContent = String(video.playbackRate) + "X"
    rate_indicator.classList.add("show")
    rate_indicator.classList.remove("fade")
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        rate_indicator.classList.remove("show")
        rate_indicator.classList.add("fade")
    }, 500);
}
function isInInput(e) { return e.target.nodeName == "INPUT" || e.target.nodeName == "TEXTAREA" || e.target.isContentEditable }
async function logKey(e) {
    if (!video) {return}
    if (video.readyState !== 4) {return}
    if (isInInput(e)) {  return }
    if (e.repeat) {return}
    // if (document.querySelector(".rate_indicator") == null) {
    //     console.log("video changed")
    //     video = document.getElementsByTagName('video')[0]
    //     rate_indicator = document.createElement("p");
    //     rate_indicator.classList.add("rate_indicator")
    //     video_parent = video.parentNode
    //     video_parent.appendChild(rate_indicator);
    //     document.addEventListener('keydown', logKey);
    //     video.addEventListener('ratechange', change_rate_indicator)
    // }
    if (e.keyCode >= keyCodeToChar['1'] && e.keyCode <= keyCodeToChar['9']) {
        e.stopPropagation();
        e.preventDefault()
        if (document.querySelectorAll("h1[time]")[e.keyCode-49]!=undefined) {
            if (e.ctrlKey) {
                let h1 = document.querySelectorAll("h1[time]")[e.keyCode-49]
                if (h1.parentElement.classList.contains("timestamps-container-chapter")){
                    removeContinuousTimestamp(h1.getAttribute("time"))
                }
                else{
                    removeTimestamp(h1.getAttribute("time"))
                }
                return;
            }
            if (e.shiftKey) {EditWithNumbers = !EditWithNumbers}
            if (EditWithNumbers){
                inputNumber = document.querySelectorAll("input[time]")[e.keyCode-49]
                inputNumber.focus()
                if (!isNaN(inputNumber.value) || inputNumber.value===''){
                    inputNumber.setSelectionRange(0, inputNumber.value.length)
                }
            }
            else{
                document.querySelectorAll("h1[time]")[e.keyCode-49].click()
            }
            if (e.shiftKey) {EditWithNumbers = !EditWithNumbers}
        }
    }
    else if ((e.keyCode === keyCodeToChar[';'] || e.keyCode === keyCodeToChar['a']) && !e.shiftKey) {
        if (video.playbackRate === 1) {
            video.currentTime -= 5
        }
        else {
            video.playbackRate = 1
        }
    }
    else if (e.keyCode === keyCodeToChar['/'] || e.keyCode === keyCodeToChar['s']) {
        if (e.keyCode === keyCodeToChar['/']) {e.preventDefault();e.stopPropagation()}
        if (e.shiftKey) {
            video.currentTime -= 30
        }
        else {
            video.currentTime -= 10
        }
    }
    else if (e.keyCode === keyCodeToChar['w']) {
        if (e.shiftKey) {
            video.currentTime += 30
        }
        else {
            video.currentTime += 5
        }        
    }
    else if ((e.keyCode === keyCodeToChar['e'] || e.keyCode === keyCodeToChar['[']) && e.shiftKey) {
        secondaryOnClick()
    }
    else if ((e.keyCode === keyCodeToChar['e'] || e.keyCode === keyCodeToChar['[']) && e.ctrlKey) {
        e.preventDefault()
        e.stopPropagation()
        let lasth1 = document.querySelector(".timestamps-container:nth-last-child(2) h1")
        if (!lasth1) return
        if (!lasth1.parentElement.classList.contains("timestamps-container-chapter")) {removeTimestamp(lasth1.getAttribute("time"))}
        else{
            removeContinuousTimestamp(document.querySelector(".timestamps-container:nth-last-child(2) h1[startTime]").getAttribute("startTime"))
        }
    }
    else if (e.keyCode === keyCodeToChar['e'] || e.keyCode === keyCodeToChar['[']) {
        let lasth1 = document.querySelector(".timestamps-container:nth-last-child(2) h1")
        if (!lasth1) return
        if (!lasth1.parentElement.classList.contains("timestamps-container-chapter")) {document.querySelector(".timestamps-container:nth-last-child(2) h1").click()}
        else{document.querySelector(".timestamps-container:nth-last-child(2) h1[startTime]").click()}
        // todo test
    }
    else if ((e.keyCode === keyCodeToChar["'"] || e.keyCode === keyCodeToChar['d']) && !e.shiftKey) {
        if (video.playbackRate >= 1.5) {
            video.playbackRate += 0.5;
        }
        else {
            video.playbackRate = 1.5
        }
    }
    else if (e.keyCode === keyCodeToChar['q'] || e.keyCode === keyCodeToChar['p']) {
        addTimeStamp(e)
    }
    else if((e.keyCode === keyCodeToChar['r'] || e.keyCode === keyCodeToChar[']']) && !e.ctrlKey && !e.shiftKey){
        if (Qs.includes(video.currentTime)) return
        let lastContainer = document.querySelector(".timestamps-container:nth-last-child(2)")
        if (lastContainer && lastContainer.classList.contains("timestamps-container-chapter")) return
        let numTimestampsContainer = Array.from(document.querySelectorAll(".timestamps-container")).length
        let timestampsContainerAnimation = numTimestampsContainer == 0 ? undefined : "none"
        if (numTimestampsContainer >= 1) { removeTimestamp(lastContainer.firstChild.getAttribute("time"), "none") }
        addTimeStamp(e, timestampsContainerAnimation=timestampsContainerAnimation)
    }
    else if(e.keyCode == keyCodeToChar['d'] && e.shiftKey){
        alwaysShowHeatmap = !alwaysShowHeatmap
        chrome.storage.local.set({ "alwaysShowHeatmap": alwaysShowHeatmap });
        if (alwaysShowHeatmap && !document.querySelector("#movie_player").classList.contains("ytp-autohide")){
            document.querySelector("#canvas-div").style.opacity = "1"
            heatMapChart.update();
            updateHeatmap = true
        }
        else{
            document.querySelector("#canvas-div").style.opacity = "0"
            updateHeatmap = false
        }
    }
    else if (e.keyCode == keyCodeToChar['r'] && e.shiftKey) {
        counter = new Array(Math.ceil(video.duration / secondsSplit)+1).fill(0);
        heatMapChart.data.datasets[0].data = counter
        heatMapChart.update();
        updateBorderColors()
    }
    else if (e.keyCode == keyCodeToChar['a'] && e.shiftKey) {
        video.currentTime = counter.indexOf(Math.max(...counter))*secondsSplit// + secondsSplit * 0.5
    }
    else if (e.keyCode == keyCodeToChar['t']){
        addContinuousTimeStampBar(e)
    }
    else if (document.querySelector(".ytp-chapters-container").childNodes.length === 1 && e.ctrlKey && (e.keyCode === keyCodeToChar['arrowLeft'] || e.keyCode === keyCodeToChar['arrowRight'])) {
        let QsPlusOffsetsArr = Qs.slice()
        let offsetsArrToSeconds = offsetsArr.flat(Infinity).map(num=>{return num * video.duration / 100})
        if (offsetsArr.length!=0){QsPlusOffsetsArr.push(...offsetsArrToSeconds.flat(Infinity))}
        QsPlusOffsetsArr.sort((a, b) => a-b)
        if (e.keyCode === keyCodeToChar['arrowLeft']) {
            QsPlusOffsetsArr.reverse()
            for (let time of QsPlusOffsetsArr) {
                if (time < video.currentTime - 5) {
                    video.currentTime = time
                    break
                }
            }
        }
        else if (e.keyCode === keyCodeToChar['arrowRight']) {
            for (let time of QsPlusOffsetsArr) {
                if (time > video.currentTime) {
                    video.currentTime = time
                    break
                }
            }
        }
    }  


}
window.addEventListener('click', event => {
    if (event.target.matches('video')) {
        event.stopPropagation();
        if (event.target.paused){
            event.target.play()
        }
        else{
            event.target.pause()
        }
    }
}, true);
window.addEventListener('keydown', logKey, true);

function updateVideoPlayer() {
    if (video===document.getElementsByTagName('video')[0]){
        if (video.readyState !== 4) { video.onloadedmetadata = addHeatMap }
        else {
            addHeatMap()
        }
        return
    }
    video = document.getElementsByTagName('video')[0]
    if (video.readyState !== 4) { video.onloadedmetadata = addHeatMap }
    else {
        addHeatMap()
    }

    video_parent = video.parentElement
    rate_indicator = document.createElement("p");
    rate_indicator.classList.add("rate_indicator")
    video_parent.appendChild(rate_indicator);
    video.addEventListener('ratechange', change_rate_indicator)
    video.addEventListener('play', ()=>{startPlayDate = new Date();span.innerHTML = "Pause to see"})
    video.addEventListener('pause', ()=>{totalPlayTime += (new Date() - startPlayDate)/1000;span.innerHTML = `Total: ${msToHours(totalPlayTime)}`})
    let span = document.createElement("span")
    span.innerHTML = "Pause to see"
    span.style.transition = "200ms opacity"
    span.style.opacity = "0"
    span.style.display = "none"
    span.style.paddingLeft = "0.5rem"
    document.querySelector("div.ytp-time-display.notranslate > span:nth-child(2)").onmouseenter = () => {
        span.style.display = ""
        span.style.opacity = "1"


    }
    document.querySelector("div.ytp-time-display.notranslate > span:nth-child(2)").onmouseleave = () => {
        span.style.opacity = "0"
        span.style.display = "none"            
    }
    document.querySelector(".ytp-time-display span:nth-child(2)").appendChild(span)



    document.getElementsByTagName('video')[0].addEventListener('pause', function(e) {
        document.querySelector("[aria-keyshortcuts='k'] > svg path").style.d = 'path("M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z")'
    });
    document.getElementsByTagName('video')[0].addEventListener('play', function(e) {
        document.querySelector("[aria-keyshortcuts='k'] > svg path").style.d = 'path("M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z")'
    });
    
    console.log(
        `%cVimTube Extension Activated`,
        `background: linear-gradient(90deg, rgba(52,84,244,1) 0%, rgba(50,129,244,1) 25%, rgba(85,166,246,1) 50%, rgba(43,189,251,1) 75%, rgba(52,84,244,1) 100%);color: gold;font-weight: 900`
    );
}

function pageUpdateListener(){
    console.log("URL changed")
    document.querySelectorAll("[time], .timestamps-container, .__youtube-heatmap__bar").forEach((e)=>{e.remove()})
    Qs = []
    totalPlayTime = 0
    if (heatMapChart) {
        counter = new Array(counter.length).fill(0);
        heatMapChart.data.datasets[0].data = counter
        heatMapChart.update();
    }
    if (window.location.href.startsWith("https://www.youtube.com/watch")){
        updateVideoPlayer();
        console.log("on /watch page")
        if (document.querySelector(".ytp-subtitles-button.ytp-button").getAttribute("aria-pressed")==="false" && document.querySelector(".ytp-subtitles-button-icon").getAttribute("fill-opacity") === '1') {
            document.querySelector(".ytp-subtitles-button.ytp-button").click()
            console.log("turned on captions")
        }
    }   
}

// if (document.readyState !== 'loading') {
//     if (window.location.href.startsWith("https://www.youtube.com/watch")){
//         console.log("on /watch page")
//         updateVideoPlayer();
//     }
//     else {
//         console.log("not on /watch page")
//     }
// }
// else {
//     document.addEventListener('DOMContentLoaded', function () {
//     if (window.location.href.startsWith("https://www.youtube.com/watch")){
//         console.log("on /watch page")
//         updateVideoPlayer();
//     }
//     else {
//         console.log("not on /watch page")
//     }
//     });
// }

window.addEventListener('yt-page-data-updated', pageUpdateListener);
waitForElement('.external-icon:first-child :nth-child(1) g:last-child').then((el) => {
    el.innerHTML = '<g id="svgGroup" stroke-linecap="round" fill-rule="evenodd" font-size="9pt" stroke-width="0.15mm" style="stroke: currentColor;stroke-width: 0.15mm;transform: translate(37%, 0%);"><path d="M 5.15 0 L 7.575 0 L 5.15 18.375 L 2 18.375 L 0 0 L 2.4 0 L 2.925 5.525 Q 3.225 8.65 3.675 15.15 A 616.104 616.104 0 0 1 3.833 13.348 Q 4.1 10.344 4.55 5.525 L 5.15 0 Z" id="0" vector-effect="non-scaling-stroke"></path><path d="M 10.5 4.6 L 10.5 18.375 L 8.375 18.375 L 8.375 4.6 L 10.5 4.6 Z M 10.5 0 L 10.5 1.825 L 8.375 1.825 L 8.375 0 L 10.5 0 Z" id="1" vector-effect="non-scaling-stroke"></path><path d="M 22.4 8.3 L 22.4 18.375 L 20.25 18.375 L 20.25 8.35 A 2.577 2.577 0 0 0 20.209 7.868 Q 20.048 7.025 19.25 7.025 A 1.153 1.153 0 0 0 18.813 7.101 Q 18.313 7.305 18.257 8.052 A 2.641 2.641 0 0 0 18.25 8.25 L 18.25 18.375 L 16.1 18.375 L 16.1 8.35 A 2.61 2.61 0 0 0 16.058 7.859 Q 15.904 7.059 15.185 7.004 A 1.435 1.435 0 0 0 15.075 7 Q 14.575 7 14.3 7.413 A 1.645 1.645 0 0 0 14.025 8.317 A 1.986 1.986 0 0 0 14.025 8.35 L 14.025 18.375 L 11.9 18.375 L 11.9 4.6 L 14.025 4.6 L 14.025 6.1 A 3.296 3.296 0 0 1 14.509 5.47 A 4.57 4.57 0 0 1 15.063 4.987 Q 15.577 4.604 16.057 4.507 A 1.611 1.611 0 0 1 16.375 4.475 A 1.511 1.511 0 0 1 17.25 4.727 Q 17.771 5.083 18.01 5.945 A 4.022 4.022 0 0 1 18.025 6 A 2.067 2.067 0 0 1 18.637 5.182 A 2.844 2.844 0 0 1 19.05 4.9 Q 19.8 4.475 20.55 4.475 A 1.5 1.5 0 0 1 21.438 4.738 Q 21.933 5.087 22.175 5.9 A 4.499 4.499 0 0 1 22.284 6.413 Q 22.4 7.15 22.4 8.3 Z" id="2" vector-effect="non-scaling-stroke"></path></g><g>                                <path d="M64.4755 3.68758H61.6768V18.5629H58.9181V3.68758H56.1194V1.42041H64.4755V3.68758Z"></path>        <path d="M71.2768 18.5634H69.0708L68.8262 17.03H68.7651C68.1654 18.1871 67.267 18.7656 66.0675 18.7656C65.2373 18.7656 64.6235 18.4928 64.2284 17.9496C63.8333 17.4039 63.6357 16.5526 63.6357 15.3955V6.03751H66.4556V15.2308C66.4556 15.7906 66.5167 16.188 66.639 16.4256C66.7613 16.6631 66.9659 16.783 67.2529 16.783C67.4974 16.783 67.7326 16.7078 67.9584 16.5573C68.1842 16.4067 68.3488 16.2162 68.4593 15.9858V6.03516H71.2768V18.5634Z"></path>        <path d="M80.609 8.0387C80.4373 7.24849 80.1621 6.67699 79.7812 6.32186C79.4002 5.96674 78.8757 5.79035 78.2078 5.79035C77.6904 5.79035 77.2059 5.93616 76.7567 6.23014C76.3075 6.52412 75.9594 6.90747 75.7148 7.38489H75.6937V0.785645H72.9773V18.5608H75.3056L75.5925 17.3755H75.6537C75.8724 17.7988 76.1993 18.1304 76.6344 18.3774C77.0695 18.622 77.554 18.7443 78.0855 18.7443C79.038 18.7443 79.7412 18.3045 80.1904 17.4272C80.6396 16.5476 80.8653 15.1765 80.8653 13.3092V11.3266C80.8653 9.92722 80.7783 8.82892 80.609 8.0387ZM78.0243 13.1492C78.0243 14.0617 77.9867 14.7767 77.9114 15.2941C77.8362 15.8115 77.7115 16.1808 77.5328 16.3971C77.3564 16.6158 77.1165 16.724 76.8178 16.724C76.585 16.724 76.371 16.6699 76.1734 16.5594C75.9759 16.4512 75.816 16.2866 75.6937 16.0702V8.96062C75.7877 8.6196 75.9524 8.34209 76.1852 8.12337C76.4157 7.90465 76.6697 7.79646 76.9401 7.79646C77.2271 7.79646 77.4481 7.90935 77.6034 8.13278C77.7609 8.35855 77.8691 8.73485 77.9303 9.26636C77.9914 9.79787 78.022 10.5528 78.022 11.5335V13.1492H78.0243Z"></path>        <path d="M84.8657 13.8712C84.8657 14.6755 84.8892 15.2776 84.9363 15.6798C84.9833 16.0819 85.0821 16.3736 85.2326 16.5594C85.3831 16.7428 85.6136 16.8345 85.9264 16.8345C86.3474 16.8345 86.639 16.6699 86.7942 16.343C86.9518 16.0161 87.0365 15.4705 87.0506 14.7085L89.4824 14.8519C89.4965 14.9601 89.5035 15.1106 89.5035 15.3011C89.5035 16.4582 89.186 17.3237 88.5534 17.8952C87.9208 18.4667 87.0247 18.7536 85.8676 18.7536C84.4777 18.7536 83.504 18.3185 82.9466 17.446C82.3869 16.5735 82.1094 15.2259 82.1094 13.4008V11.2136C82.1094 9.33452 82.3987 7.96105 82.9772 7.09558C83.5558 6.2301 84.5459 5.79736 85.9499 5.79736C86.9165 5.79736 87.6597 5.97375 88.1771 6.32888C88.6945 6.684 89.059 7.23433 89.2707 7.98457C89.4824 8.7348 89.5882 9.76961 89.5882 11.0913V13.2362H84.8657V13.8712ZM85.2232 7.96811C85.0797 8.14449 84.9857 8.43377 84.9363 8.83593C84.8892 9.2381 84.8657 9.84722 84.8657 10.6657V11.5641H86.9283V10.6657C86.9283 9.86133 86.9001 9.25221 86.846 8.83593C86.7919 8.41966 86.6931 8.12803 86.5496 7.95635C86.4062 7.78702 86.1851 7.7 85.8864 7.7C85.5854 7.70235 85.3643 7.79172 85.2232 7.96811Z"></path>      </g>';
    document.querySelector(".external-icon").style.display = "inline"
});



// let stopOnce = false
// const observer = new MutationObserver(mutations => {
//     if (document.querySelector(".ytp-speedmaster-user-edu").style.display === "none") {stopOnce = true}
// });
// observer.observe(document.querySelector(".ytp-speedmaster-user-edu"), {
//     attributes: true,
//     attributeFilter: ["style"]
// });




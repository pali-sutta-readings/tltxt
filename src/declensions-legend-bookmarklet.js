const LEGEND_WHITE_URL = "https://profound-labs.github.io/tltxt/cases-legend-white-large.png";
const LEGEND_BLACK_URL = "https://profound-labs.github.io/tltxt/cases-legend-black-large.png";

function create_legend_div() {
  var wrap_div = document.createElement('div');
  wrap_div.innerHTML = `
<style>
#legend {
    display: none;
    position: absolute;
    bottom: 50px;
    right: 20px;
    z-index: 9;
    text-align: center;
    width: 125px;
    min-width: 125px;
    border-radius: 9px;
    overflow: hidden;
    resize: both;
    background-color: hsl(224, 40%, 40%);
}

#legend.light {
    background-color: #FCFCFC;
    color: black;
    border: 1px solid #E8E8E8;
}

#legend.dark {
    background-color: #202025;
    color: white;
    border: 1px solid #333333;
}

#legend_body {
    cursor: move;
}

#legend_header {
    padding: 5px;
    cursor: move;
    z-index: 10;
    font-size: 0.8em;
}
#legend_footer {
    padding: 5px;
    cursor: move;
    z-index: 10;
}

.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
  vertical-align: middle;
}
</style>
<div id="legend" class="light">
    <div id="legend_header" style="display: flex;">
        <span id="legend_dark_btn" style="cursor: pointer;">
            <svg class="icon"><use xlink:href="#icon-lightbulb-solid"></use></svg>
        </span>
        <span style="padding: 0 2px; flex: 1;">
            Declensions
        </span>
        <span id="legend_close_btn" style="cursor: pointer;">
            <svg class="icon"><use xlink:href="#icon-circle-xmark-solid"></use></svg>
        </span>
    </div>
    <div id="legend_body">
        <img id="legend_img" width="100%" src="${LEGEND_WHITE_URL}">
    </div>
    <div id="legend_footer"></div>
</div>

<svg style="display:none;">
    <symbol id="icon-lightbulb-solid" viewBox="0 0 512 512">
        <path d="M272 384c9.6-31.9 29.5-59.1 49.2-86.2c0 0 0 0 0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4c0 0 0 0 0 0c19.8 27.1 39.7 54.4 49.2 86.2l160 0zM192 512c44.2 0 80-35.8 80-80l0-16-160 0 0 16c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z"/>
    </symbol>
</svg>

<svg style="display:none;">
    <symbol id="icon-circle-xmark-solid" viewBox="0 0 512 512">
        <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/>
    </symbol>
</svg>
    `;

  document.body.appendChild(wrap_div);

  wrap_div.querySelector('#legend_close_btn').addEventListener('click', legend_close_btn);
  wrap_div.querySelector('#legend_dark_btn').addEventListener('click', legend_dark_btn);

  legend_div = wrap_div.querySelector('#legend');
  // Make the DIV element draggable:
  dragElement(legend_div, ["legend_header", "legend_body"]);

  return legend_div;
}

function legend_close_btn() {
  let legend_el = document.querySelector('#legend');
  legend_el.style.display = 'none';
}

function legend_dark_btn() {
  let legend_el = document.querySelector('#legend');
  let img_el = document.querySelector('#legend_img');

  if (img_el.src.includes("white-large.png")) {
    img_el.src = LEGEND_BLACK_URL;
    legend_el.classList.remove("light")
    legend_el.classList.add("dark")
  } else {
    img_el.src = LEGEND_WHITE_URL;
    legend_el.classList.remove("dark")
    legend_el.classList.add("light")
  }
}

// https://www.w3schools.com/howto/howto_js_draggable.asp
function dragElement(elmnt, drag_ids = []) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  drag_ids.forEach((id) => {
    if (document.getElementById(id)) {
      document.getElementById(id).onmousedown = dragMouseDown;
    }
  });

  function dragMouseDown(e) {
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function show_legend() {
  var div = document.getElementById('legend');
  if (!div) {
    div = create_legend_div();
  }
  div.style.display = 'block';
}

show_legend();

const canvas = document.getElementById('canvas')
canvas.width = 1000
canvas.height = 750

const ctx = canvas.getContext('2d')

ctx.lineCap = 'round'
ctx.lineJoin = 'round'

const colorInput = document.getElementById('colorInput')
let currentColor = colorInput.value
colorInput.onchange = () => { currentColor = colorInput.value }

const widthInput = document.getElementById('widthInput')
let currentWidth = widthInput.value
widthInput.onchange = () => { currentWidth = widthInput.value }

const penBtn = document.getElementById('penBtn')
const eraserBtn = document.getElementById('eraserBtn')
const currentToolText = document.getElementById('currentTool')

let currentTool = 'pen'

penBtn.onclick = () => {
  currentTool = 'pen'
  currentToolText.innerText = 'pen'
}

eraserBtn.onclick = () => {
  currentTool = 'eraser'
  currentToolText.innerText = 'eraser'
}

document.getElementById('plainBgBtn').onclick = () => {
  canvas.style.backgroundImage = 'none'
}
document.getElementById('linesBgBtn').onclick = () => {
  canvas.style.backgroundImage = 'url(./img/backgrounds/lines.png)'
}
document.getElementById('checkerboardBgBtn').onclick = () => {
  canvas.style.backgroundImage = 'url(./img/backgrounds/checkerboard.png)'
}


let paths = []

let drawing = false
let drawingLine = false

let mouseDown = 0;
canvas.onmousedown = ev => { if (ev.which === 1) ++mouseDown }
canvas.onmouseup = ev => { if (ev.which === 1) --mouseDown }

function drawPaths() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (const path of paths) {
    ctx.globalCompositeOperation = path.eraser ? 'destination-out' : 'source-over'
    ctx.lineWidth = path.width
    ctx.strokeStyle = path.color
    ctx.beginPath()
    ctx.moveTo(path.points[0].x, path.points[0].y)
    for (const point of path.points) {
      ctx.lineTo(point.x, point.y)
    }
    ctx.stroke()
  }
}

function undo() {
  paths.pop()
  drawPaths()
}

document.body.onmousemove = ev => {
  if (mouseDown) {
    if (drawingLine) {
      paths[paths.length - 1].points[1] = {x: ev.clientX, y: ev.clientY}
    } else if (drawing) {
      paths[paths.length - 1].points.push({x: ev.clientX, y: ev.clientY})
    } else {
      drawing = true
      paths.push({
        color: currentColor, 
        width: currentWidth, 
        points: [{x: ev.clientX, y: ev.clientY}],
        eraser: currentTool === 'eraser',
      })
      if (shiftPressed) {
        drawingLine = true
        paths[paths.length - 1].points.push({x: ev.clientX, y: ev.clientY})
      }
    }
    drawPaths()
  } else {
    drawing = false
    drawingLine = false
  }
}

document.body.onmouseup = ev => {
  drawing = false
  drawingLine = false
}

canvas.oncontextmenu = ev => ev.preventDefault()

let shiftPressed = false
let ctrlPressed = false
let undoing = false

document.onkeydown = ev => {
  if (ctrlPressed && ev.key === 'z' && !undoing) {
    undoing = true
    undo()
  }
  shiftPressed = ev.shiftKey
  ctrlPressed = ev.ctrlKey
}

document.onkeyup = ev => {
  if (ev.key === 'z') {
    undoing = false
  }
  shiftPressed = ev.shiftKey
  ctrlPressed = ev.ctrlKey
}

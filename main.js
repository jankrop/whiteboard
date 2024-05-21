const canvas = document.getElementById('canvas')
canvas.width = 1006
canvas.height = 670

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

let currentTool = 'pen'

penBtn.onclick = () => {
  currentTool = 'pen'
  penBtn.classList.add('bg-slate-200')
  eraserBtn.classList.remove('bg-slate-200')
}

eraserBtn.onclick = () => {
  currentTool = 'eraser'
  eraserBtn.classList.add('bg-slate-200')
  penBtn.classList.remove('bg-slate-200')
}

document.getElementById('plainBgBtn').onclick = () => {
  canvas.style.backgroundImage = 'none'
}
document.getElementById('linesBgBtn').onclick = () => {
  canvas.style.backgroundImage = 'url(./img/backgrounds/lines.png)'
}
document.getElementById('gridBgBtn').onclick = () => {
  canvas.style.backgroundImage = 'url(./img/backgrounds/grid.png)'
}

let paths = []

let drawing = false
let drawingLine = false

let mouseDown = 0;
document.body.onmousedown = ev => { if (ev.which === 1) ++mouseDown; console.log('hi') }
document.body.onmouseup = ev => {
  if (ev.which === 1) --mouseDown
  drawing = false
  drawingLine = false
}

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

function getMouseCoords(ev) {
  return {
    x: ev.clientX - canvas.getBoundingClientRect().left,
    y: ev.clientY - canvas.getBoundingClientRect().top,
  }
}

document.body.onmousemove = ev => {
  if (mouseDown) {
    if (drawingLine) {
      paths[paths.length - 1].points[1] = getMouseCoords(ev)
    } else if (drawing) {
      paths[paths.length - 1].points.push(getMouseCoords(ev))
    } else if (canvas.matches(':hover')) {
      drawing = true
      paths.push({
        color: currentColor, 
        width: currentWidth, 
        points: [getMouseCoords(ev)],
        eraser: currentTool === 'eraser',
      })
      if (shiftPressed) {
        drawingLine = true
        paths[paths.length - 1].points.push(getMouseCoords(ev))
      }
    }
    drawPaths()
  } else {
    drawing = false
    drawingLine = false
  }
  console.log(mouseDown)
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

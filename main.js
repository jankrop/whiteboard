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

let paths = []

let drawing = false

let mouseDown = 0;
canvas.onmousedown = () => { ++mouseDown; }
canvas.onmouseup = () => { --mouseDown; }

function drawPaths() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (const path of paths) {
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
    if (drawing) {
      paths[paths.length - 1].points.push({x: ev.clientX, y: ev.clientY})
    } else {
      drawing = true
      paths.push({color: currentColor, width: currentWidth, points: [{x: ev.clientX, y: ev.clientY}]})
    }
    drawPaths()
  } else {
    drawing = false
  }
}

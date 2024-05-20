const canvas = document.getElementById('canvas')
canvas.width = 1000
canvas.height = 750

const ctx = canvas.getContext('2d')

ctx.lineCap = 'round'

const colorInput = document.getElementById('colorInput')
colorInput.onchange = () => { ctx.strokeStyle = colorInput.value }

ctx.strokeStyle = colorInput.value

const widthInput = document.getElementById('widthInput')
widthInput.onchange = () => { ctx.lineWidth = widthInput.value }

ctx.lineWidth = widthInput.value

let oldX = -1
let oldY = -1

let drawing = true

let mouseDown = 0;
canvas.onmousedown = () => { ++mouseDown; }
canvas.onmouseup = () => { --mouseDown; }

document.body.onmousemove = ev => {
  if (mouseDown) {
    if (oldX < 0) {
      oldX = ev.clientX
      oldY = ev.clientY
    }
    ctx.beginPath()
    ctx.moveTo(oldX, oldY)
    ctx.lineTo(ev.clientX, ev.clientY)
    ctx.stroke()

    oldX = ev.clientX
    oldY = ev.clientY
  } else {
    oldX = -1
    oldY = -1
  }
}

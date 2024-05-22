<script setup>
import {ref, onMounted} from "vue";

const canvas = ref(null)

const canvasWidth = ref(1006)
const canvasHeight = ref(670)

const currentColor = ref('black')
const currentWidth = ref(2)

const currentTool = ref('pen')

const backgroundClass = ref('bg-slate-50')

let paths = []
let redoPaths = []

let drawing = false
let drawingLine = false

let mouseDown = 0;
document.body.onmousedown = ev => { if (ev.which === 1) ++mouseDown; }
document.body.onmouseup = ev => {
    if (ev.which === 1) --mouseDown
    drawing = false
    drawingLine = false
}

let ctx

function undo() {
    if (!paths) return
    const lastPath = paths[paths.length - 1]
    paths.pop()
    redoPaths.push(lastPath)
    drawPaths()
}

function redo() {
    if (!redoPaths) return
    const lastPath = redoPaths[redoPaths.length - 1]
    redoPaths.pop()
    paths.push(lastPath)
    drawPaths()
}

function drawPaths() {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
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

function getMouseCoords(ev) {
    return {
        x: ev.clientX - canvas.value.getBoundingClientRect().left,
        y: ev.clientY - canvas.value.getBoundingClientRect().top,
    }
}

function main() {
    ctx = canvas.value.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    document.body.onmousemove = ev => {
        if (mouseDown) {
            if (drawingLine) {
                paths[paths.length - 1].points[1] = getMouseCoords(ev)
            } else if (drawing) {
                paths[paths.length - 1].points.push(getMouseCoords(ev))
            } else if (canvas.value.matches(':hover')) {
                drawing = true
                redoPaths = []
                paths.push({
                    color: currentColor.value,
                    width: currentWidth.value,
                    points: [getMouseCoords(ev)],
                    eraser: currentTool.value === 'eraser',
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
}

onMounted(main)
</script>

<template>
    <h1 class="text-4xl font-bold text-center">New Board <i class="fa-solid fa-pen-to-square"></i></h1>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="cursor-crosshair m-4" :class="backgroundClass"></canvas>
    <div class="flex justify-center text-center text-xl">
        <div class="pill-menu">
            <button @click="currentTool = 'pen'" :class="{ 'bg-slate-200': currentTool === 'pen' }">
                <span class="material-symbols-outlined">edit</span>
            </button>
            <button @click="currentTool = 'eraser'" :class="{ 'bg-slate-200': currentTool === 'eraser' }">
                <span class="material-symbols-outlined">ink_eraser</span>
            </button>
        </div>
        <div class="pill-menu p-1">
            <input type="color" v-model="currentColor" class="rounded-full h-7 w-10">
            <input type="range" v-model="currentWidth" min="1" max="10" class="w-32 ml-3">
        </div>

        <div class="pill-menu">
            <button @click="undo">
                <span class="material-symbols-outlined">undo</span>
            </button>
            <button @click="redo()">
                <span class="material-symbols-outlined">redo</span>
            </button>
        </div>

        <div class="pill-menu">
            <button @click="backgroundClass = 'bg-slate-50'">
                <span class="material-symbols-outlined">check_box_outline_blank</span>
            </button>
            <button @click="backgroundClass = 'bg-lines'">
                <span class="material-symbols-outlined">table_rows</span>
            </button>
            <button @click="backgroundClass = 'bg-grid'">
                <span class="material-symbols-outlined">grid_on</span>
            </button>
        </div>

    </div>
</template>
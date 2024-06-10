<script setup>
import {ref, onMounted, computed} from "vue";

const uuid = window.location.pathname.split('/').pop()
// const uuid = ref('990000e6-7c7d-4342-99a8-61abcd2745a8')
const uuidRef = ref(uuid)

const loading = ref(true)

const canvas = ref(null)
const canvasOverlay = ref(null)

const canvasWidth = ref(1006)
const canvasHeight = ref(670)

const currentColor = ref('black')
const currentWidth = ref(2)

const currentTool = ref('pen')

const backgroundClass = ref('bg-slate-50')

const title = ref('New board')
const editTitle = ref(false)

const selectedObject = ref(null)

const objects = ref([])
let redoPaths = []

let textObjects = ref([])

const textObjectsDOM = ref([])

let drawing = false
let drawingLine = false

let mouseDown = 0;
document.body.onmousedown = ev => { if (ev.which === 1) ++mouseDown; }
document.body.onmouseup = ev => {
    if (ev.which === 1) --mouseDown
    drawing = false
    drawingLine = false
    if (currentTool.value === 'text' && canvas.value.matches(':hover')) {
        objects.value.push({
            type: 'text',
            id: objects.value.length,
            content: 'Enter text here',
            coords: getMouseCoords(ev),
            mousedown: false,
        })
    }
}

let ctx

function undo() {
    if (!objects.value) return
    const lastPath = objects.value[objects.value.length - 1]
    objects.value.pop()
    redoPaths.push(lastPath)
    drawPaths()
}

function redo() {
    if (!redoPaths) return
    const lastPath = redoPaths[redoPaths.length - 1]
    redoPaths.pop()
    objects.value.push(lastPath)
    drawPaths()
}

function addMath(formula) {
    objects.value.push({
        type: 'math',
        id: objects.value.length,
        content: formula,
        coords: {x: canvas.value.width / 2, y: canvas.value.height / 2},
    })
}

function drawPaths() {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    for (const path of objects.value) {
        if (path.type !== 'path') continue
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

async function getBoardData() {
    try {
        const response = await fetch(window.djangoUrls.get_board_data)
        const response_json = await response.json()
        title.value = response_json.title
        objects.value = response_json.objects
        textObjects = computed(() => objects.value.filter(obj => obj.type === 'text' || obj.type === 'math'))
        loading.value = false
        console.log(response_json)
    } catch (e) {
        console.log('Error while fetching data: ', e)
    }
}

function main() {
    ctx = canvas.value.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    document.body.onclick = () => {
        if (currentTool.value === 'select') {
            for (const text of textObjectsDOM.value) {
                if (selectedObject === text.getAttribute('data-id')) continue
                if (text.matches(':hover')) {
                    selectedObject.value = text.getAttribute('data-id')
                    return
                }
            }
        }
        selectedObject.value = null
    }

    document.body.onmousemove = ev => {
        if (selectedObject.value !== null) {
            if (objects.value[selectedObject.value].mousedown) {
                objects.value[selectedObject.value].coords = getMouseCoords(ev)
                drawPaths()
            }
        }

        if (mouseDown && (currentTool.value === 'pen' || currentTool.value === 'eraser')) {
            if (drawingLine) {
                objects.value[objects.value.length - 1].points[1] = getMouseCoords(ev)
            } else if (drawing) {
                objects.value[objects.value.length - 1].points.push(getMouseCoords(ev))
            } else if (canvas.value.matches(':hover')) {
                drawing = true
                redoPaths = []
                objects.value.push({
                    type: 'path',
                    color: currentColor.value,
                    width: currentWidth.value,
                    points: [getMouseCoords(ev)],
                    eraser: currentTool.value === 'eraser',
                })
                if (shiftPressed) {
                    drawingLine = true
                    objects.value[objects.value.length - 1].points.push(getMouseCoords(ev))
                }
            }
            drawPaths()
        } else {
            drawing = false
            drawingLine = false
        }
    }

    canvas.value.oncontextmenu = ev => ev.preventDefault()

    let shiftPressed = false
    let ctrlPressed = false
    let undoing = false
    let redoing = false

    document.onkeydown = ev => {
        if (ctrlPressed && ev.key === 'z' && !undoing) {
            ev.preventDefault()
            undoing = true
            undo()
        } else if (ctrlPressed && ev.key === 'y' && !redoing) {
            ev.preventDefault()
            redoing = true
            redo()
        }
        if (ev.key === 'Delete' && selectedObject.value !== null) {
            objects.value.splice(selectedObject.value, 1)
            selectedObject.value = null
            drawPaths()
        }
        shiftPressed = ev.shiftKey
        ctrlPressed = ev.ctrlKey
    }

    document.onkeyup = ev => {
        if (ev.key === 'z') {
            undoing = false
        }
        if (ev.key === 'y') {
            redoing = false
        }
        shiftPressed = ev.shiftKey
        ctrlPressed = ev.ctrlKey
    }

    getBoardData()
}

onMounted(main)
</script>

<template>
    <h1 :class="{ '!block': !loading }" class="hidden text-4xl font-bold text-center">
        <input v-if="editTitle" v-model="title"
               @keydown.enter="editTitle = !title.replace(' ', '')" @blur="editTitle = false"
               class="text-4xl font-bold text-center bg-slate-50 rounded border-none outline-none" placeholder="Board title">
        <span v-else @click="editTitle = true">{{ title }}</span>
    </h1>
    <div :class="[{ '!block': !loading }, backgroundClass]" class="hidden my-4" style="width: 1006px; height: 670px;">
        <div class="absolute" ref="canvasOverlay">
            <div class="absolute text-lg p-1"
                 :class="{'selected': selectedObject == text.id}"
                 :style="{'left': text.coords.x + 'px', 'top': text.coords.y + 'px'}"
                 v-for="text in textObjects" ref="textObjectsDOM" :data-id="text.id"
                 @mousedown="text.mousedown = true" @mouseup="text.mousedown = false">
                <div v-if="text.type === 'math'" class="w-96" v-html="text.content"></div>
                <div v-else-if="selectedObject != text.id" class="w-96">{{ text.content }}</div>
                <textarea v-else class="w-96 bg-transparent border-none outline-none resize-none" cols="1" v-model="text.content"></textarea>

                <div class="absolute top-0 left-0 bg-slate-700 rounded-full w-2 h-2 -translate-x-1 -translate-y-1" v-if="selectedObject == text.id"></div>
                <div class="absolute top-0 left-full bg-slate-700 rounded-full w-2 h-2 -translate-x-1 -translate-y-1" v-if="selectedObject == text.id"></div>
                <div class="absolute top-1/2 left-0 bg-slate-700 rounded-full w-2 h-2 -translate-x-1 -translate-y-1" v-if="selectedObject == text.id"></div>
                <div class="absolute top-1/2 left-full bg-slate-700 rounded-full w-2 h-2 -translate-x-1 -translate-y-1" v-if="selectedObject == text.id"></div>
                <div class="absolute top-full left-0 bg-slate-700 rounded-full w-2 h-2 -translate-x-1 -translate-y-1" v-if="selectedObject == text.id"></div>
                <div class="absolute top-full left-full bg-slate-700 rounded-full w-2 h-2 -translate-x-1 -translate-y-1" v-if="selectedObject == text.id"></div>
            </div>
        </div>
        <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="absolute"
                :class="{'cursor-crosshair': currentTool !== 'select', 'pointer-events-none': currentTool === 'select'}"></canvas>
    </div>
    <div :class="{ '!flex': !loading }" class="hidden justify-center text-center text-xl">
        <div class="pill-menu">
            <button @click="currentTool = 'select'" :class="{ 'bg-slate-200': currentTool === 'select' }">
                <Icon>arrow_selector_tool</Icon>
            </button>
            <button @click="currentTool = 'pen'" :class="{ 'bg-slate-200': currentTool === 'pen' }">
                <Icon>edit</Icon>
            </button>
            <button @click="currentTool = 'eraser'" :class="{ 'bg-slate-200': currentTool === 'eraser' }">
                <Icon>ink_eraser</Icon>
            </button>
            <button @click="currentTool = 'text'" :class="{ 'bg-slate-200': currentTool === 'text' }">
                <Icon>title</Icon>
            </button>
            <MathjaxInput @submit="addMath">
                <Icon>functions</Icon>
            </MathjaxInput>
        </div>
        <div class="pill-menu p-1">
            <input type="color" v-model="currentColor" class="rounded-full h-7 w-10">
            <input type="range" v-model="currentWidth" min="1" max="10" class="w-32 ml-3">
        </div>

        <div class="pill-menu">
            <button @click="undo">
                <Icon>undo</Icon>
            </button>
            <button @click="redo()">
                <Icon>redo</Icon>
            </button>
        </div>

        <div class="pill-menu">
            <button @click="backgroundClass = 'bg-slate-50'">
                <Icon>check_box_outline_blank</Icon>
            </button>
            <button @click="backgroundClass = 'bg-lines'">
                <Icon>table_rows</Icon>
            </button>
            <button @click="backgroundClass = 'bg-grid'">
                <Icon>grid_on</Icon>
            </button>
        </div>
    </div>
<!--    <div v-if="loading" class="fixed top-0 left-0 w-full h-screen bg-slate-300 flex justify-center items-center">-->
<!--        <div class="text-2xl mr-3">Loading whiteboard</div>-->
<!--        <div class="w-8 h-8 rounded-full bg-conic animate-spin"></div>-->
<!--        <div class="fixed bottom-10 text-slate-500">Board ID: {{ uuidRef }}</div>-->
<!--    </div>-->
</template>
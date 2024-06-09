<script setup>
import {ref} from "vue";

const formula = ref(null)
const formulaContent = ref('')
const show = ref(false)

function updateMath(event) {
    formulaContent.value = event.target.value
    formula.value.innerText = `\\[ ${event.target.value} \\]`
    MathJax.typeset()
}

function showPopup() {
    show.value = true
    setTimeout(MathJax.typeset, 0)
}
</script>

<template>
    <button @click="showPopup"><slot></slot></button>
    <Popup
        title="Enter math formula" :show="show"
        @close = "show = false" @submit="show = false; $emit('submit', formula.innerHTML)" submit-button="true"
        class="text-base">

        Please enter a math formula, as valid LaTeX
        <br>
        <input class="w-full bg-transparent resize-none border-none outline outline-1 outline-slate-700 rounded p-2 font-mono" @input="updateMath">
        <p ref="formula">\[  \]</p>
    </Popup>
</template>
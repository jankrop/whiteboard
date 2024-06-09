<script setup>
defineProps(['show', 'title', 'submitButton'])
</script>

<template>
    <div class="fixed inset-0 bg-slate-700 bg-opacity-50 flex justify-center items-center" v-if="show">
        <div class="bg-slate-50 p-3 rounded-lg min-w-72">
            <div class="flex justify-between items-center">
                <h3 class="text-xl font-bold">{{ title }}</h3>
                <button class="flex items-center" @click="$emit('close')"><Icon>close</Icon></button>
            </div>
            <hr class="m-2">
            <slot></slot>
            <div class="flex justify-end" v-if="submitButton">
                <button class="bg-slate-700 !rounded p-2 text-white" @click="$emit('submit'); $emit('close')">Submit</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
button {
    width: initial;
    height: initial;
    border-radius: initial;
}
</style>
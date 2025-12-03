<template>
    <transition name="fade">
        <div v-if="visible" class="fixed inset-0 bg-white flex items-center justify-center z-[99999]">
            <div class="relative flex flex-col items-center">
                <img src="@/assets/Logo/Azonation-Logo.png" alt="Azonation ..." class="w-20 h-20 animate-smooth-scale" />

                <div class="mt-3 h-[3px] w-24 bg-gray-200 overflow-hidden rounded">
                    <div class="h-full bg-indigo-600 animate-loading-stripe"></div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(true);

function hide() {
    visible.value = false;
}

defineExpose({ hide });
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes smoothScale {
    0% {
        transform: scale(0.85);
        opacity: 0.1;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes loadingStripe {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(200%);
    }
}

.animate-smooth-scale {
    animation: smoothScale 0.8s ease-out;
}

.animate-loading-stripe {
    animation: loadingStripe 0.9s linear infinite;
}
</style>

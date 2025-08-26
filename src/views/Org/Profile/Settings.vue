<template>
    <!-- Time zone section -->
    <section>
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Time zone</h3>
        </div>
        <div>
            <p class="ml-5 pb-9">Current timezone: {{ name }} </p>
        </div>
    </section>

    <!-- Notification section -->
    <section>
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Notifications</h3>
        </div>

    </section>

    <!-- Language section -->
    <section>
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Language</h3>
        </div>

    </section>

    <!-- Country section -->
    <section>
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Country</h3>
        </div>

    </section>

    <!-- Currency section -->
    <section>
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Currency</h3>
        </div>

    </section>

</template>

<script>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";

const auth = authStore;
const name = auth?.user?.name;
</script>

<style scoped>
</style>
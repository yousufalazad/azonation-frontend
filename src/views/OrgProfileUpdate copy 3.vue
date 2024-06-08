//create home component
<script setup>
import { ref, reactive } from 'vue';
import { loginAuthStore } from '@/store/loginLogoutStore';

const orgId = loginAuthStore.org.id; 
const org_logo = reactive({
    image: '',
});

// const addProduct = () => {
//     const res = loginAuthStore.uploadProtectedApi('/api/org_logo', org_logo);
//     res.then(response => {
//         loginAuthStore.org_logo.push(response.data);
//         addProductToggle.value = false;
//     });
// }




const selectFile = (event) => {
    const file = event.target.files[ 0 ];
    org_logo.image = file;
}

</script>
<template>
    <div class="bg-white">
        <div class="mx-auto px-12 py-8">
            <h2 class="text-2xl font-bold tracking-tight text-gray-900">Products</h2>
            
            <div>
                <div class="space-y-4 md:space-y-6">
                    <div>
                        <label for="password" class="block mb-2 text-sm font-medium text-gray-900 ">Image</label>
                        <input @change="selectFile($event)" type="file"
                            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5">
                    </div>

                    <button @click="addProduct()"
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        <span>Save</span>
                    </button>
                </div>
            </div>
            <div>
                <div class="flex items-center my-5 border-2	" v-for="(item, index) in loginAuthStore.org_logo" :key="index">
                    <img :src="loginAuthStore.apiBase + '/' + item.image" alt="">
                    <p class="w-2/3">
                        {{ item.name }}
                    </p>
                    <p class="w-[100px]">{{ item.category.name }}</p>
                    <p class="w-[100px]">{{ item.description }}</p>
                    <router-link :to="`/admin/products/${item.id}`"
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Edit</router-link>
                    <button @click="deleteProduct(index, item)"
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Delete</button>
                </div>
            </div>
        </div>
    </div>

    <!-- <div class="profile-update">
        <h2>Profile Update</h2>
        <div class="mb-3">
            <label for="logo" class="form-label">Logo</label>
            <input type="file" id="logo" @change="handleImageUpload" class="form-control">
        </div>
        <div class="mb-3" v-if="logoPath">
            <img :src="`${baseURL}${logoPath}`" alt="Organization Logo" class="img-thumbnail">

        </div>
        <button @click="updateOrganisationDetails" class="btn btn-primary">Update</button>
    </div> -->
</template>

<style>
img {
    max-width: 100px;
}
</style>
<template>
    <!-- Logo Section -->
    <section>
        <h2 class="text-lg font-bold mb-4 left-color-shade py-2">Logo</h2>
        <div class="mb-4 flex justify-between pb-9">
            <div v-if="logoPath">
                <img :src="`${baseURL}${logoPath}`" alt="Logo" class="rounded-lg h-[150px] ml-5">
            </div>
            <div>
                <label for="logo" class="block text-sm font-medium text-gray-700 mb-4">Upload new logo</label>
                <input type="file" id="logo" @change="handleImageUpload"
                    class="block w-full text-sm text-gray-500 mb-4">
                <button @click="profileImageUpdate" class="mt-2 bg-blue-500 text-white py-2 px-4 rounded">Save</button>
            </div>
        </div>
    </section>
  
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { authStore } from '../../../store/authStore';
  import Swal from "sweetalert2";
  
  const auth = authStore;
  const userId = auth.user.id;
  const name = auth.user.name;
  const email = auth.user.email;
  const username = auth.user.username;
  const baseURL = 'http://localhost:8000';
  
  // logo
  const logoPath = ref('');
  const selectedImage = ref(null);
  
  
  const fetchLogo = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/profileimage/${userId}`, {}, 'GET');
        if (response.status && response.data.image) {
            logoPath.value = response.data.image;
        }
    } catch (error) {
        console.error("Error fetching logo:", error);
    }
  };
  
  const profileImageUpdate = async () => {
    if (selectedImage.value) {
        const formData = new FormData();
        formData.append('image', selectedImage.value);
        try {
            const imageResponse = await auth.uploadProtectedApi(`/api/profileimage/${userId}`, formData);
            if (imageResponse.status) {
                Swal.fire('Success', 'Logo saved successfully', 'success');
                logoPath.value = imageResponse.data.image;
                window.location.reload();
            } else {
                Swal.fire('Error', 'Failed to update logo', 'error');
            }
        } catch (error) {
            console.error("Error updating logo:", error);
            Swal.fire('Error', 'Failed to update logo', 'error');
        }
    }
  };
  
  const handleImageUpload = (event) => {
    selectedImage.value = event.target.files[0];
  };
  
  onMounted(fetchLogo);
  
  </script>
  
  <style scoped>
  .fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  .bg-opacity-75 {
    background-color: rgba(0, 0, 0, 0.75);
  }
  
  .max-w-md {
    max-width: 28rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
  }
  
  .btn-primary {
    background-color: #007bff;
    color: white;
  }
  
  .btn-success {
    background-color: #28a745;
    color: white;
  }
  
  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }
  
  .flex {
    display: flex;
  }
  
  .justify-end {
    justify-content: flex-end;
  }
  </style>
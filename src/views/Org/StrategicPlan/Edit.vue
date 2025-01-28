<script setup>
import { ref, onMounted } from 'vue';
import Quill from 'quill';
import Swal from 'sweetalert2';
import { useRouter, useRoute } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();
const route = useRoute();
const id = route.params.id;

const title = ref('');
const plan = ref('');
const start_date = ref('');
const end_date = ref('');
const status = ref(1);
const quillInstance = ref(null);
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

// Fetch the existing record data
const fetchRecord = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/get-strategic-plan/${id}`, {}, 'GET');
        if (response.status) {
            const data = response.data;

            // Process images
            images.value = (data.images || []).map((image) => ({
                id: image.id,
                file: {
                    preview: image.image_url || '', // Ensure `file_path` contains the correct URL
                    name: image.file_name || '',
                },
            }));

            // Process documents
            documents.value = (data.documents || []).map(doc => ({
                id: doc.id,
                file: { preview: doc.document_url, name: doc.file_name },
            }));


            title.value = data.title;
            plan.value = data.plan;
            start_date.value = data.start_date;
            end_date.value = data.end_date;
            status.value = data.status;

            // Set Quill content
            quillInstance.value.root.innerHTML = plan.value;
        } else {
            Swal.fire('Error!', 'Failed to fetch the record.', 'error');
        }
    } catch (error) {
        console.error('Error fetching record:', error);
        Swal.fire('Error!', 'Failed to fetch the record.', 'error');
    }
};

// Initialize Quill editor
const initializeQuill = () => {
    quillInstance.value = new Quill('#plan-editor', {
        theme: 'snow',
        placeholder: 'Edit plan...',
        modules: {
            toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link']],
        },
    });

    quillInstance.value.on('text-change', () => {
        plan.value = quillInstance.value.root.innerHTML;
    });
};

const handleFileChange = (event, fileList, index) => {
    const file = event.target.files[0];
    if (file) {
        fileList[index].file = {
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        };
    }
};

const addMoreFiles = (fileList) => {
    fileList.push({ id: Date.now(), file: null });
};

const removeFile = (fileList, index) => {
    if (fileList[index].file && fileList[index].file.preview) {
        URL.revokeObjectURL(fileList[index].file.preview); // Release memory
    }
    fileList.splice(index, 1);
};

// Submit the edited form
const submitForm = async () => {
    const payload = {
        title: title.value,
        plan: plan.value,
        start_date: start_date.value,
        end_date: end_date.value,
        status: status.value,
    };

    try {
        const response = await auth.fetchProtectedApi(`/api/update-strategic-plan/${id}`, payload, 'PUT');
        if (response.status) {
            await Swal.fire('Success!', 'Strategic plan updated successfully.', 'success');
            router.push({ name: 'strategic-plan' });
        } else {
            Swal.fire('Error!', 'Failed to update the strategic plan.', 'error');
        }
    } catch (error) {
        console.error('Error updating strategic plan:', error);
        Swal.fire('Error!', 'Failed to update the strategic plan.', 'error');
    }
};

onMounted(() => {
    initializeQuill();
    fetchRecord();
});
</script>

<template>
    <div class="max-w-3xl mx-auto p-5 bg-white rounded shadow">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Edit Strategic Plan</h5>
            <button @click="router.push({ name: 'strategic-plan' })"
                class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
                Back to Strategic Plan List
            </button>
        </div>
        <form @submit.prevent="submitForm">
            <div class="mb-4">
                <label for="title" class="block font-semibold mb-2">Title</label>
                <input v-model="title" type="text" id="title" class="w-full p-2 border rounded"
                    placeholder="Enter title" required />
            </div>
            <div class="mb-4">
                <label for="plan-editor" class="block font-semibold mb-2">Plan</label>
                <div id="plan-editor" class="w-full h-40 border rounded"></div>
            </div>
            <div class="mb-4">
                <label for="start_date" class="block font-semibold mb-2">Start Date</label>
                <input v-model="start_date" type="date" id="start_date" class="w-full p-2 border rounded" />
            </div>
            <div class="mb-4">
                <label for="end_date" class="block font-semibold mb-2">End Date</label>
                <input v-model="end_date" type="date" id="end_date" class="w-full p-2 border rounded" />
            </div>
            <div class="mb-4">
                <label for="status" class="block font-semibold mb-2">Status</label>
                <select v-model="status" id="status" class="w-full p-2 border rounded">
                    <option value="1">Active</option>
                    <option value="0">Disabled</option>
                </select>
            </div>

            <!-- Images Upload -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Upload Images</label>
                <div class="space-y-3">
                    <!-- <div v-for="(image, index) in data.images" :key="image.id">
            <img :src="image.image_url" alt="Preview" class="w-full h-full object-cover" />            
          </div> -->



                    <!-- <div>
            <div v-if="images.length" class="flex gap-4">
              <div v-for="file in images" :key="file.id" class="w-16 h-16">
                <img v-if="file.file?.preview" :src="file.file.preview" alt="Meeting Image"
                  class="w-16 h-16 object-cover rounded" />
                <p class="text-sm text-center truncate">{{ file.file.name }}</p>
              </div>
            </div>
            <div v-else>
              <p>No images available.</p>
            </div>
          </div> -->

                    <!-- <div v-for="file in images" :key="file.id">
            <img v-if="file?.file?.preview" :src="file.file.preview" class="w-16 h-16 object-cover rounded" />
          </div> -->


                    <div v-for="(file, index) in images" :key="file.id" class="flex items-center gap-4">
                        <input type="file" class="border border-gray-300 rounded-md py-2 px-4" accept="image/*"
                            @change="event => handleFileChange(event, images, index)" />

                        <div v-if="file.file && file.file.preview" class="w-16 h-16 border rounded-md overflow-hidden">
                            <img :src="file.file.preview" alt="Preview" class="w-full h-full object-cover" />
                        </div>

                        <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                            @click="removeFile(images, index)">X</button>
                    </div>
                </div>
                <button type="button" class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                    @click="() => addMoreFiles(images)">
                    Add more image
                </button>
            </div>

            <!-- Documents Upload -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Upload Documents</label>
                <div class="space-y-3">
                    <div v-for="(file, index) in documents" :key="file.id" class="flex items-center gap-4">
                        <input type="file" class="border border-gray-300 rounded-md py-2 px-4" accept=".pdf,.doc,.docx"
                            @change="event => handleFileChange(event, documents, index)" />

                        <span v-if="file.file" class="truncate w-32">{{ file.file.name }}</span>

                        <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                            @click="removeFile(documents, index)">X</button>
                    </div>
                </div>
                <button type="button" class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                    @click="() => addMoreFiles(documents)">
                    Add more document
                </button>
            </div>

            <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded">Update</button>
        </form>
    </div>
</template>
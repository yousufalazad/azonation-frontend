<template>
    <div class="flex">
      <!-- Left Side Menu -->
      <div class="w-1/5 bg-gray-100 p-1 space-y-2">
        <h2 class="text-lg font-bold mb-4">Fundamental info</h2>
        <ul class="space-y-2">
          <li v-for="(title, section) in sectionTitles" :key="section">
            <button @click="selectedSection = section" :class="buttonClass(section)">{{ title }}</button>
          </li>
        </ul>
      </div>
  
      <!-- Right Side Content -->
      <div class="w-4/5 bg-white p-6">
        <h2 class="text-xl font-bold mb-4">{{ sectionTitles[selectedSection] }}</h2>
        <p>{{ sectionContent[selectedSection] }}</p>
        <button @click="openModal(selectedSection)" class="text-blue-500 mt-4">Edit</button>
      </div>
  
      <!-- Modal Component -->
      <div v-if="isModalVisible" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div class="bg-white p-5 rounded-lg shadow-lg max-w-md w-full">
          <h3 class="text-lg font-bold mb-3">{{ modalTitle }}</h3>
          <textarea v-if="isTextarea" v-model="modalModel" class="w-full h-32 p-2 border border-gray-300 rounded"></textarea>
          <input v-else type="text" v-model="modalModel" class="w-full p-2 border border-gray-300 rounded">
          <div class="flex justify-end mt-4">
            <button @click="saveModal" class="bg-blue-500 text-white py-2 px-4 rounded mr-2">Save</button>
            <button @click="closeModal" class="bg-gray-300 py-2 px-4 rounded">Close</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { authStore } from '../../../store/authStore';
  import Swal from "sweetalert2";
  
  const auth = authStore;
  const userId = auth.user.id;
  
  // Profile data
  const shortDescription = ref('Brief intro about the organization. Content value');
  const detailDescription = ref('Detailed description of the organization.');
  const whoWeAre = ref('We are a non-profit organization.');
  const whatWeDo = ref('We work on various social projects.');
  const howWeDo = ref('By collaborating with communities.');
  const mission = ref('Our mission is to improve lives.');
  const vision = ref('A world without poverty.');
  const value = ref('Integrity, Collaboration, Innovation.');
  const areasOfFocus = ref('Education, Health, Environment.');
  const causes = ref('Social justice, Climate change.');
  const impact = ref('We have helped 5000+ people.');
  const whyJoinUs = ref('To make a difference in the world.');
  const scopeOfWork = ref('Global operations with local focus.');
  const organisingDate = ref('2020-05-10');
  const foundationDate = ref('2010-08-15');
  const status = ref('Active');
  
  const sectionTitles = ref({
    shortDescription: 'Short Description',
    detailDescription: 'Detail Description',
    whoWeAre: 'Who We Are',
    whatWeDo: 'What We Do',
    howWeDo: 'How We Do',
    mission: 'Mission',
    vision: 'Vision',
    value: 'Value',
    areasOfFocus: 'Areas of Focus',
    causes: 'Causes',
    impact: 'Impact',
    whyJoinUs: 'Why Join Us',
    scopeOfWork: 'Scope of Work',
    organisingDate: 'Organising Date',
    foundationDate: 'Foundation Date',
    status: 'Status',
  });
  
  const sectionContent = ref({
    shortDescription: shortDescription.value,
    detailDescription: detailDescription.value,
    whoWeAre: whoWeAre.value,
    whatWeDo: whatWeDo.value,
    howWeDo: howWeDo.value,
    mission: mission.value,
    vision: vision.value,
    value: value.value,
    areasOfFocus: areasOfFocus.value,
    causes: causes.value,
    impact: impact.value,
    whyJoinUs: whyJoinUs.value,
    scopeOfWork: scopeOfWork.value,
    organisingDate: organisingDate.value,
    foundationDate: foundationDate.value,
    status: status.value,
  });
  
  // Modal logic
  const isModalVisible = ref(false);
  const modalTitle = ref('');
  const modalModel = ref('');
  const isTextarea = ref(false);
  const selectedSection = ref('shortDescription');
  
  // Convert camel case field names to snake case
  const camelToSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  
  const updateSingleField = async (field, value) => {
    const snakeCaseField = camelToSnake(field);
    try {
      const response = await auth.fetchProtectedApi(`/api/org-profile-update/${userId}`, { [snakeCaseField]: value }, 'PUT');
      if (response.status) {
        Swal.fire('Success', `${sectionTitles.value[field]} updated successfully`, 'success');
      } else {
        Swal.fire('Error', `Failed to update ${sectionTitles.value[field]}`, 'error');
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      Swal.fire('Error', `Failed to update ${sectionTitles.value[field]}`, 'error');
    }
  };
  
  const openModal = (section) => {
    modalTitle.value = sectionTitles.value[section];
    modalModel.value = sectionContent.value[section];
    isTextarea.value = !['organisingDate', 'foundationDate', 'status'].includes(section);
    isModalVisible.value = true;
  };
  
  const saveModal = () => {
    sectionContent.value[selectedSection.value] = modalModel.value;
    updateSingleField(selectedSection.value, modalModel.value);
    closeModal();
  };
  
  const closeModal = () => {
    isModalVisible.value = false;
  };
  
  const buttonClass = (section) => selectedSection.value === section ? 'text-blue-500 font-bold' : 'text-gray-700';
  
  </script>
  
  <style scoped>
  .profile-menu button {
    display: block;
    width: 100%;
    text-align: left;
  }
  
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
  </style>
  
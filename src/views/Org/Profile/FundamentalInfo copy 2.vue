<template>
    <div class="flex">
      <!-- Left Side Menu -->
      <div class="w-1/4 bg-gray-100 p-4 space-y-2">
        <h2 class="text-lg font-bold mb-4">Profile Menu</h2>
        <ul class="space-y-2">
          <li>
            <button @click="selectedSection = 'shortDescription'" :class="buttonClass('shortDescription')">Short Description</button>
          </li>
          <li>
            <button @click="selectedSection = 'detailDescription'" :class="buttonClass('detailDescription')">Detail Description</button>
          </li>
          <li>
            <button @click="selectedSection = 'whoWeAre'" :class="buttonClass('whoWeAre')">Who We Are</button>
          </li>
          <li>
            <button @click="selectedSection = 'whatWeDo'" :class="buttonClass('whatWeDo')">What We Do</button>
          </li>
          <li>
            <button @click="selectedSection = 'howWeDo'" :class="buttonClass('howWeDo')">How We Do</button>
          </li>
          <li>
            <button @click="selectedSection = 'mission'" :class="buttonClass('mission')">Mission</button>
          </li>
          <li>
            <button @click="selectedSection = 'vision'" :class="buttonClass('vision')">Vision</button>
          </li>
          <li>
            <button @click="selectedSection = 'value'" :class="buttonClass('value')">Value</button>
          </li>
          <li>
            <button @click="selectedSection = 'areasOfFocus'" :class="buttonClass('areasOfFocus')">Areas of Focus</button>
          </li>
          <li>
            <button @click="selectedSection = 'causes'" :class="buttonClass('causes')">Causes</button>
          </li>
          <li>
            <button @click="selectedSection = 'impact'" :class="buttonClass('impact')">Impact</button>
          </li>
          <li>
            <button @click="selectedSection = 'whyJoinUs'" :class="buttonClass('whyJoinUs')">Why Join Us</button>
          </li>
          <li>
            <button @click="selectedSection = 'scopeOfWork'" :class="buttonClass('scopeOfWork')">Scope of Work</button>
          </li>
          <li>
            <button @click="selectedSection = 'organisingDate'" :class="buttonClass('organisingDate')">Organising Date</button>
          </li>
          <li>
            <button @click="selectedSection = 'foundationDate'" :class="buttonClass('foundationDate')">Foundation Date</button>
          </li>
          <li>
            <button @click="selectedSection = 'status'" :class="buttonClass('status')">Status</button>
          </li>
        </ul>
      </div>
  
      <!-- Right Side Content -->
      <div class="w-3/4 bg-white p-6">
        <h2 class="text-xl font-bold mb-4">{{ sectionTitles[selectedSection] }}</h2>
        <p>{{ sectionContent[selectedSection] }}</p>
        <button @click="openModal(selectedSection)" class="text-blue-500 mt-4">Edit</button>
      </div>
  
      <!-- Modal Component -->
      <div v-if="isModalVisible" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div class="bg-white p-5 rounded-lg shadow-lg max-w-md w-full">
          <h3 class="text-lg font-bold mb-3">{{ modalTitle }}</h3>
          <textarea v-if="isTextarea" v-model="modalModel"
            class="w-full h-32 p-2 border border-gray-300 rounded"></textarea>
          <input v-else type="text" v-model="modalModel" class="w-full p-2 border border-gray-300 rounded">
          <div class="flex justify-end mt-4">
            <button @click="saveModal" class="bg-blue-500 text-white py-2 px-4 rounded mr-2">Save</button>
            <button @click="closeModal" class="bg-gray-300 py-2 px-4 rounded">Close</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        selectedSection: 'shortDescription',
        isModalVisible: false,
        modalModel: '',
        modalTitle: '',
        isTextarea: false,
        shortDescription: 'Brief intro about the organization.',
        detailDescription: 'Detailed description of the organization.',
        whoWeAre: 'We are a non-profit organization.',
        whatWeDo: 'We work on various social projects.',
        howWeDo: 'By collaborating with communities.',
        mission: 'Our mission is to improve lives.',
        vision: 'A world without poverty.',
        value: 'Integrity, Collaboration, Innovation.',
        areasOfFocus: 'Education, Health, Environment.',
        causes: 'Social justice, Climate change.',
        impact: 'We have helped 5000+ people.',
        whyJoinUs: 'To make a difference in the world.',
        scopeOfWork: 'Global operations with local focus.',
        organisingDate: '2020-05-10',
        foundationDate: '2010-08-15',
        status: 'Active',
        sectionTitles: {
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
        },
        sectionContent: {
          shortDescription: 'Brief intro about the organization.',
          detailDescription: 'Detailed description of the organization.',
          whoWeAre: 'We are a non-profit organization.',
          whatWeDo: 'We work on various social projects.',
          howWeDo: 'By collaborating with communities.',
          mission: 'Our mission is to improve lives.',
          vision: 'A world without poverty.',
          value: 'Integrity, Collaboration, Innovation.',
          areasOfFocus: 'Education, Health, Environment.',
          causes: 'Social justice, Climate change.',
          impact: 'We have helped 5000+ people.',
          whyJoinUs: 'To make a difference in the world.',
          scopeOfWork: 'Global operations with local focus.',
          organisingDate: '2020-05-10',
          foundationDate: '2010-08-15',
          status: 'Active',
        }
      };
    },
    methods: {
      openModal(section) {
        this.modalTitle = this.sectionTitles[section];
        this.modalModel = this.sectionContent[section];
        this.isModalVisible = true;
        this.isTextarea = section !== 'organisingDate' && section !== 'foundationDate' && section !== 'status';
      },
      saveModal() {
        this.sectionContent[this.selectedSection] = this.modalModel;
        this.closeModal();
      },
      closeModal() {
        this.isModalVisible = false;
      },
      buttonClass(section) {
        return this.selectedSection === section ? 'text-blue-500 font-bold' : 'text-gray-700';
      }
    }
  };
  </script>
  
  <style scoped>
  .profile-menu button {
    display: block;
    width: 100%;
    text-align: left;
  }
  </style>
  
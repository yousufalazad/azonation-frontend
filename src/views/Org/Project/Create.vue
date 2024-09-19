<template>
  <div class="container mx-auto mt-6">
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-2xl font-bold mb-4">Create and Edit Project</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="projectTitle" class="block text-sm font-medium text-gray-700">Project Title</label>
          <input v-model="project.title" type="text" id="projectTitle" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter project title" required>
        </div>

        <div>
          <label for="shortDescription" class="block text-sm font-medium text-gray-700">Short Description</label>
          <textarea v-model="project.short_description" id="shortDescription" rows="3" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter short description"></textarea>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="project.description" id="description" rows="4" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Write project description"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="venue" class="block text-sm font-medium text-gray-700">Venue Name</label>
            <input v-model="project.venue" type="text" id="venue" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter venue name">
          </div>

          <div>
            <label for="date" class="block text-sm font-medium text-gray-700">Project Date</label>
            <input v-model="project.date" type="date" id="date" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>

        <div>
          <label for="requirements" class="block text-sm font-medium text-gray-700">Requirements</label>
          <input v-model="project.requirements" type="text" id="requirements" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter requirements">
        </div>

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Project Status</label>
          <select v-model="project.status" id="status" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="hold">On Hold</option>
          </select>
        </div>

        <div class="text-right">
          <button @click.prevent="createProject" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Create Project
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      project: {
        title: '',
        short_description: '',
        description: '',
        venue: '',
        date: '',
        requirements: '',
        status: 'active',
      }
    };
  },
  methods: {
    createProject() {
      // Handle form submission logic
      console.log(this.project);
    },
    handleSubmit() {
      // Add additional form validation or submission logic here
      this.createProject();
    }
  }
};
</script>

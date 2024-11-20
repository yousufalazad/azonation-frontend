<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-1 text-center">Price rate</h1>
    <h6 class="mb-5 text-center">Per member per day</h6>

    <!-- Error State -->
    <div v-if="errorMessage" class="text-red-500 text-center py-8">
      {{ errorMessage }}
    </div>

    <!-- No PriceRates Found -->
    <div v-else-if="priceRates.length === 0" class="text-gray-500 text-center py-8">
      No price rates found.
    </div>

    <!-- Price Rates Horizontal Layout -->
    <div v-else class="bg-white border rounded-md overflow-auto">
      <table class="min-w-full">
        <thead>
          <tr>
            <th class="py-2 px-4 border">Region \ Package</th>
            <th v-for="priceRate in priceRates" :key="priceRate.id" class="py-2 px-4 border">
              Package {{ priceRate.package_id }}
            </th>
            <th class="py-2 px-4 border">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="region in regions" :key="region.index">
            <td class="py-2 px-4 border">{{ region.label }}</td>
            <td v-for="priceRate in priceRates" :key="priceRate.id" class="py-2 px-4 border">
              {{ priceRate[`region${region.index}`] }}
            </td>
            <td class="py-2 px-4 border text-center">
              <button @click="openEditModal(region.index)" class="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                Edit
              </button>
            </td>
          </tr>
          <tr>
            <td class="py-2 px-4 border">Status</td>
            <td v-for="priceRate in priceRates" :key="priceRate.id" class="py-2 px-4 border">{{ priceRate.status }}</td>
            <td class="py-2 px-4 border"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Edit Prices for Region {{ editingRegion }}</h2>
        
        <div v-for="priceRate in priceRates" :key="priceRate.id" class="mb-3">
          <label class="block text-sm font-medium mb-1">
            Package {{ priceRate.package_id }}
          </label>
          <input
            v-model="priceRate[`region${editingRegion}`]"
            type="number"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div class="flex justify-end mt-4">
          <button @click="closeModal" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">
            Cancel
          </button>
          <button @click="saveChanges" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const priceRates = ref([]);
const errorMessage = ref(null);

const isModalOpen = ref(false);
const editingRegion = ref(null);

const fetchPriceRate = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/price-rate');
    priceRates.value = response.status ? response.data : [];
  } catch (error) {
    console.error("Error fetching price rates:", error);
    errorMessage.value = "Error loading price rates. Please try again later.";
    priceRates.value = [];
  }
};

const openEditModal = (regionIndex) => {
  editingRegion.value = regionIndex;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingRegion.value = null;
};

const saveChanges = async () => {
  try {
    const response = await auth.fetchProtectedApi(
      '/api/price-rate/update',
      { priceRates: priceRates.value }, // Pass parameters here
      'PUT' // Specify the request type as PUT
    );
    
    if (response.status) {
      isModalOpen.value = false;
    } else {
      errorMessage.value = response.message || "Failed to update price rates.";
    }
  } catch (error) {
    console.error("Error saving changes:", error);
    errorMessage.value = "Error saving changes. Please try again later.";
  }
};


const regions = [
  { index: 1, label: "Region 1 (Rest of the World, currency: USD)" },
  { index: 2, label: "Region 2 (UK, currency: GBP)" },
  { index: 3, label: "Region 3 (USA, currency: USD)" },
  { index: 4, label: "Region 4 (Canada, currency: CAD)" },
  { index: 5, label: "Region 5 (European Union, currency: EUR)" },
  { index: 6, label: "Region 6 (China, currency: CNY)" },
  { index: 7, label: "Region 7 (Bangladesh, currency: BDT)" },
  { index: 8, label: "Region 8 (India, currency: INR)" },
  { index: 9, label: "Region 9 (Japan, currency: JPY)" },
  { index: 10, label: "Region 10 (Malaysia, currency: MYR)" },
  { index: 11, label: "Region 11 (Russia, currency: RUB)" },
  { index: 12, label: "Region 12 (Australia and New Zealand, currency: AUD)" },
  { index: 13, label: "Region 13 (3 non-EU members of the European Free Trade Association (EFTA), currency: EUR)" },
  { index: 14, label: "Region 14 (South America, currency: USD)" },
  { index: 15, label: "Region 15 (Middle East, currency: USD)" },
  { index: 16, label: "Region 16 (Asia excluding Bangladesh, China, Malaysia, India, currency: USD)" },
  { index: 17, label: "Region 17 (Africa, currency: USD)" },
  { index: 18, label: "Region 18 (Reserved, currency: USD)" },
  { index: 19, label: "Region 19 (Reserved, currency: USD)" },
  { index: 20, label: "Region 20 (Reserved, currency: USD)" },
];

onMounted(fetchPriceRate);
/*
European Union (EU) member countries:
Austria
Belgium
Bulgaria
Croatia
Cyprus
Czech Republic
Denmark
Estonia
Finland
France
Germany
Greece
Hungary
Ireland
Italy
Latvia
Lithuania
Luxembourg
Malta
Netherlands
Poland
Portugal
Romania
Slovakia
Slovenia
Spain
Sweden

3 non-EU members of the European Free Trade Association (EFTA): Norway, Iceland, and Liechtenstein.

South American Countries (12 Total):
Argentina
Bolivia
Brazil
Chile
Colombia
Ecuador
Guyana
Paraguay
Peru
Suriname
Uruguay
Venezuela


List of Middle Eastern Countries:
The Middle East is a region that generally includes the following countries:

Western Asia:
Bahrain
Cyprus
Iran
Iraq
Israel
Jordan
Kuwait
Lebanon
Oman
Palestine
Qatar
Saudi Arabia
Syria
Turkey
United Arab Emirates (UAE)
Yemen
Sometimes Included:
Egypt (due to its geographic and cultural ties to the Middle East).


South Asian countries excluding Bangladesh, China, Malaysia, and India:
Afghanistan
Bhutan
Nepal
Pakistan
Sri Lanka
Maldives
These countries are part of South Asia, but the ones you requested to exclude are left out. Let me know if you need more information!


African countries:
Algeria
Angola
Benin
Botswana
Burkina Faso
Burundi
Cabo Verde (Cape Verde)
Cameroon
Central African Republic
Chad
Comoros
Democratic Republic of the Congo (DRC)
Republic of the Congo (Congo)
Djibouti
Egypt
Equatorial Guinea
Eritrea
Eswatini (Swaziland)
Ethiopia
Gabon
Gambia
Ghana
Guinea
Guinea-Bissau
Ivory Coast (Côte d'Ivoire)
Kenya
Lesotho
Liberia
Libya
Madagascar
Malawi
Mali
Mauritania
Mauritius
Morocco
Mozambique
Namibia
Niger
Nigeria
Rwanda
São Tomé and Príncipe
Senegal
Seychelles
Sierra Leone
Somalia
South Africa
South Sudan
Sudan
Tanzania
Togo
Tunisia
Uganda
Zambia
Zimbabwe
*/
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>

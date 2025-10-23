<template>
  <div class="min-h-screen bg-green-600 py-4">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow-xl border border-green-200 p-6">
        <!-- Header -->
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Student Registration</h1>
          <p class="text-gray-600 mb-4">Please fill out the form below to register as a student</p>
          <p class="text-sm text-gray-500">
            Already have an account? 
            <router-link to="/student/login" class="font-medium text-green-600 hover:text-green-700 transition-colors duration-200">
              Sign in here
            </router-link>
          </p>
        </div>
      
        <!-- Registration Form -->
        <form class="space-y-4" @submit.prevent="registerStudent">
        <!-- Alert message for errors -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md">
          {{ error }}
        </div>

        <!-- Registration success message -->
        <div v-if="registrationSuccess" class="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-md">
          <p class="font-medium">Registration received. Please check your email for verification</p>
        </div>
        
          <!-- Personal Information -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b border-green-200 pb-2 mb-4">Personal Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <div class="relative">
                  <input 
                    v-model="student.firstName" 
                    id="firstName" 
                    name="firstName" 
                    type="text" 
                    required 
                    class="peer block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 placeholder-transparent"
                    :class="{'border-red-500': errors.firstName}"
                    placeholder="First Name"
                  >
                <label for="firstName" class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-gray-600">
                  First Name
                </label>
              </div>
              <p v-if="errors.firstName" class="mt-1 text-xs text-red-500">{{ errors.firstName }}</p>
            </div>
            
            <div class="md:col-span-1">
              <div class="relative">
                <input 
                  v-model="student.middleName" 
                  id="middleName" 
                  name="middleName" 
                  type="text" 
                  class="peer block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 placeholder-transparent"
                  placeholder="Middle Name"
                >
                <label for="middleName" class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-gray-600">
                  Middle Name
                </label>
              </div>
            </div>

            <div class="md:col-span-1">
              <div class="relative">
                <input 
                  v-model="student.lastName" 
                  id="lastName" 
                  name="lastName" 
                  type="text" 
                  required 
                  class="peer block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 placeholder-transparent"
                  :class="{'border-red-500': errors.lastName}"
                  placeholder="Last Name *"
                >
                <label for="lastName" class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-gray-600">
                  Last Name
                </label>
              </div>
              <p v-if="errors.lastName" class="mt-1 text-xs text-red-500">{{ errors.lastName }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <select 
                v-model="student.nameExtension" 
                id="nameExtension" 
                name="nameExtension" 
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Extension (Optional)</option>
                <option value="Jr.">Jr.</option>
                <option value="Sr.">Sr.</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
              </select>
            </div>
            
            <div>
              <div class="relative">
                <input 
                  v-model="student.idNumber" 
                  id="idNumber" 
                  name="idNumber" 
                  type="text" 
                  placeholder="XX-XXXX-XXXXX or XX-XXXX-XXXXXX"
                  required 
                  class="peer block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 placeholder-transparent"
                  :class="{'border-red-500': errors.idNumber}"
                >
                <label for="idNumber" class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-gray-600">
                  ID Number
                </label>
              </div>
              <p v-if="errors.idNumber" class="mt-1 text-xs text-red-500">{{ errors.idNumber }}</p>
            </div>
            
            <div>
              <select 
                v-model="student.gender" 
                id="gender" 
                name="gender" 
                required 
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                :class="{'border-red-500': errors.gender}"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <p v-if="errors.gender" class="mt-1 text-xs text-red-500">{{ errors.gender }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <div class="relative">
                <input 
                  v-model="student.email" 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="example@phinmaed.com"
                  required 
                  class="peer block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 placeholder-transparent"
                  :class="{'border-red-500': errors.email}"
                >
                <label for="email" class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-gray-600">
                  Email
                </label>
              </div>
              <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
            </div>
            
            <div>
              <div class="flex">
                <span class="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  63+
                </span>
                <input 
                  v-model="student.contactNumber" 
                  id="contactNumber" 
                  name="contactNumber" 
                  type="text" 
                  required 
                  class="block w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  :class="{'border-red-500': errors.contactNumber}"
                  placeholder="Contact Number"
                >
              </div>
              <p v-if="errors.contactNumber" class="mt-1 text-xs text-red-500">{{ errors.contactNumber }}</p>
            </div>
          </div>
        </div>

          <!-- Address Information -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b border-green-200 pb-2 mb-4">Address Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="addressRegion" class="block text-sm font-medium text-gray-700">Region *</label>
              <select 
                id="regionSelect" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                :class="{'border-red-500': errors.addressRegion}"
                @change="handleRegionChange($event)"
              >
                <option value="">Select Region</option>
                <option v-for="region in regions" :key="region.code" :value="region.code">
                  {{ region.name }}
                </option>
              </select>
              <p v-if="errors.addressRegion" class="mt-1 text-xs text-red-500">{{ errors.addressRegion }}</p>
            </div>
            
            <div>
              <label for="addressProvince" class="block text-sm font-medium text-gray-700">Province *</label>
              <select 
                id="provinceSelect" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                :class="{'border-red-500': errors.addressProvince}"
                @change="handleProvinceChange($event)"
                :disabled="!selectedRegionCode"
              >
                <option value="">Select Province</option>
                <option v-for="province in provinces" :key="province.code" :value="province.code">
                  {{ province.name }}
                </option>
              </select>
              <p v-if="errors.addressProvince" class="mt-1 text-xs text-red-500">{{ errors.addressProvince }}</p>
            </div>
            
            <div>
              <label for="addressMunicipality" class="block text-sm font-medium text-gray-700">Municipality/City *</label>
              <select 
                id="municipalitySelect" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                :class="{'border-red-500': errors.addressMunicipality}"
                @change="handleMunicipalityChange($event)"
                :disabled="!selectedProvinceCode"
              >
                <option value="">Select Municipality/City</option>
                <option v-for="municipality in municipalities" :key="municipality.code" :value="municipality.code">
                  {{ municipality.name }} {{ municipality.cityClass ? '(City)' : '' }}
                </option>
              </select>
              <p v-if="errors.addressMunicipality" class="mt-1 text-xs text-red-500">{{ errors.addressMunicipality }}</p>
            </div>
            
            <div>
              <label for="addressBarangay" class="block text-sm font-medium text-gray-700">Barangay *</label>
              <select 
                id="barangaySelect" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                :class="{'border-red-500': errors.addressBarangay}"
                @change="handleBarangayChange($event)"
                :disabled="!selectedMunicipalityCode"
              >
                <option value="">Select Barangay</option>
                <option v-for="barangay in barangays" :key="barangay.code" :value="barangay.code">
                  {{ barangay.name }}
                </option>
              </select>
              <p v-if="errors.addressBarangay" class="mt-1 text-xs text-red-500">{{ errors.addressBarangay }}</p>
            </div>
            
            <div>
              <label for="addressStreet" class="block text-sm font-medium text-gray-700">Street/Purok *</label>
              <input 
                v-model="student.address.street" 
                id="addressStreet" 
                name="addressStreet" 
                type="text"
                placeholder="Street or Purok name"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                :class="{'border-red-500': errors.addressStreet}"
              >
              <p v-if="errors.addressStreet" class="mt-1 text-xs text-red-500">{{ errors.addressStreet }}</p>
            </div>
            
            <div>
              <label for="addressBlock" class="block text-sm font-medium text-gray-700">Block/Building/Unit</label>
              <input 
                v-model="student.address.block" 
                id="addressBlock" 
                name="addressBlock" 
                type="text" 
                placeholder="Block, Building, Unit"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
            </div>
          </div>
        </div>
          
          <!-- Academic Information -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b border-green-200 pb-2 mb-4">Academic Information</h3>
        
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="yearLevel" class="block text-sm font-medium text-gray-700">Year Level *</label>
              <select 
                v-model="student.yearLevel" 
                id="yearLevel" 
                name="yearLevel" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                :class="{'border-red-500': errors.yearLevel}"
                @change="loadSections"
              >
                <option value="">Select Year Level</option>
                <option v-for="yearLevel in availableYearLevels" :key="yearLevel" :value="yearLevel">
                  {{ yearLevel }} Year
                </option>
              </select>
              <p v-if="errors.yearLevel" class="mt-1 text-xs text-red-500">{{ errors.yearLevel }}</p>
            </div>
            
            <div>
              <label for="section" class="block text-sm font-medium text-gray-700">SSP Section *</label>
              <select 
                v-model="student.section" 
                id="section" 
                name="section" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                :class="{'border-red-500': errors.section}"
                :disabled="!student.yearLevel"
              >
                <option value="">Select Section</option>
                <option v-for="section in availableSections" :key="section" :value="section">{{ section }}</option>
              </select>
              <p v-if="errors.section" class="mt-1 text-xs text-red-500">{{ errors.section }}</p>
            </div>
            
            <div v-if="student.yearLevel !== '2nd'">
              <label for="major" class="block text-sm font-medium text-gray-700">Major *</label>
              <select 
                v-model="student.major" 
                id="major" 
                name="major" 
                :required="student.yearLevel !== '2nd'"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                :class="{'border-red-500': errors.major}"
                :disabled="!student.yearLevel"
              >
                <option value="">Select Major</option>
                <option v-for="major in availableMajors" :key="major" :value="major">{{ major }}</option>
              </select>
              <p v-if="errors.major" class="mt-1 text-xs text-red-500">{{ errors.major }}</p>
            </div>
          </div>
        </div>
        
          <!-- Password -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b border-green-200 pb-2 mb-4">Account Security</h3>
        
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password *</label>
              <input 
                v-model="student.password" 
                id="password" 
                name="password" 
                type="password" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                :class="{'border-red-500': errors.password}"
              >
              <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
              <p class="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.
              </p>
            </div>
            
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password *</label>
              <input 
                v-model="student.confirmPassword" 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                :class="{'border-red-500': errors.confirmPassword}"
              >
              <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-500">{{ errors.confirmPassword }}</p>
            </div>
          </div>
        </div>
        
          <!-- Privacy and Terms Agreement -->
          <div class="bg-blue-50 rounded-lg p-4 mb-4">
            <div class="flex items-start space-x-3">
              <input 
                v-model="agreedToTerms" 
                id="termsCheckbox" 
                type="checkbox" 
                class="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                :class="{'border-red-500': errors.terms}"
              >
              <div class="flex-1">
                <label for="termsCheckbox" class="text-sm text-gray-700">
                  I agree to the 
                  <button 
                    type="button" 
                    @click="showPrivacyModal = true"
                    class="text-green-600 hover:text-green-700 underline font-medium"
                  >
                    Data Privacy Act (R.A. 10173)
                  </button>
                  and understand that my personal information will be collected, processed, and stored securely for educational purposes only.
                </label>
                <p v-if="errors.terms" class="mt-1 text-xs text-red-500">{{ errors.terms }}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-center pt-4">
            <button 
              type="submit" 
              class="w-full max-w-md flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              :disabled="loading || !agreedToTerms"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Registration...
              </span>
              <span v-else class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Complete Registration
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Privacy Modal -->
    <div v-if="showPrivacyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-bold text-gray-900">Data Privacy Act (R.A. 10173)</h3>
            <button 
              @click="showPrivacyModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="prose max-w-none">
            <h4 class="text-lg font-semibold text-gray-800 mb-3">Republic Act No. 10173 - Data Privacy Act of 2012</h4>
            
            <div class="space-y-4 text-sm text-gray-700">
              <div>
                <h5 class="font-semibold text-gray-800 mb-2">Section 1. Short Title</h5>
                <p>This Act shall be known as the "Data Privacy Act of 2012".</p>
              </div>

              <div>
                <h5 class="font-semibold text-gray-800 mb-2">Section 2. Declaration of Policy</h5>
                <p>It is the policy of the State to protect the fundamental human right of privacy, of communication while ensuring free flow of information to promote innovation and growth. The State recognizes the vital role of information and communications technology in nation-building and its inherent obligation to ensure that personal information in information and communications systems in the government and in the private sector are secured and protected.</p>
              </div>

              <div>
                <h5 class="font-semibold text-gray-800 mb-2">Your Rights as a Data Subject</h5>
                <ul class="list-disc list-inside space-y-1 ml-4">
                  <li>Right to be informed about the collection and processing of your personal data</li>
                  <li>Right to access your personal data</li>
                  <li>Right to object to the processing of your personal data</li>
                  <li>Right to erasure or blocking of your personal data</li>
                  <li>Right to damages for any violation of your data privacy rights</li>
                </ul>
              </div>

              <div>
                <h5 class="font-semibold text-gray-800 mb-2">How We Use Your Information</h5>
                <p>Your personal information collected through this registration form will be used solely for:</p>
                <ul class="list-disc list-inside space-y-1 ml-4">
                  <li>Student enrollment and academic record management</li>
                  <li>Communication regarding your academic progress</li>
                  <li>Administrative purposes related to your education</li>
                  <li>Compliance with educational regulations and requirements</li>
                </ul>
              </div>

              <div>
                <h5 class="font-semibold text-gray-800 mb-2">Data Security</h5>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely and access is restricted to authorized personnel only.</p>
              </div>

              <div>
                <h5 class="font-semibold text-gray-800 mb-2">Contact Information</h5>
                <p>For any questions or concerns regarding your personal data, you may contact our Data Protection Officer at:</p>
                <p class="ml-4">Email: dpo@phinmaed.com<br>Phone: (02) 123-4567</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button 
              @click="showPrivacyModal = false"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { notificationService } from '../services/notificationService';
import psgcService from '../services/psgcService';
import { systemOptionsService } from '../services/systemOptionsService';
import api from '../services/api';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const registrationSuccess = ref(false);
const showPrivacyModal = ref(false);
const agreedToTerms = ref(false);

// Student form data
const student = reactive({
  firstName: '',
  middleName: '',
  lastName: '',
  nameExtension: '',
  idNumber: '',
  email: '',
  gender: '',
  contactNumber: '',
  address: {
    block: '',
    street: '',
    barangay: '',
    municipality: '',
    province: '',
    region: ''
  },
  yearLevel: '',
  section: '',
  password: '',
  confirmPassword: '',
  major: ''
});

// Form validation errors
const errors = reactive({
  firstName: '',
  lastName: '',
  idNumber: '',
  email: '',
  gender: '',
  contactNumber: '',
  yearLevel: '',
  section: '',
  password: '',
  confirmPassword: '',
  major: '',
  addressRegion: '',
  addressProvince: '',
  addressMunicipality: '',
  addressBarangay: '',
  addressStreet: '',
  terms: ''
});

// Available sections based on selected year level
const availableSections = ref([]);

// Available majors based on selected year level
const availableMajors = ref([]);

// System options data
const systemOptions = ref(null);

// Available year levels from system options
const availableYearLevels = ref(['2nd', '3rd', '4th']);

// PSGC address data
const regions = ref([]);
const provinces = ref([]);
const municipalities = ref([]);
const barangays = ref([]);

// Selected location codes for API calls
const selectedRegionCode = ref('');
const selectedProvinceCode = ref('');
const selectedMunicipalityCode = ref('');
const isCitySelected = ref(false);

// Handle custom address entries
const customAddress = reactive({
  region: false,
  province: false,
  municipality: false,
  barangay: false
});

// Load regions from PSGC API
const loadRegions = async () => {
  try {
    loading.value = true;
    const data = await psgcService.getRegions();
    regions.value = data.sort((a, b) => a.name.localeCompare(b.name));
    loading.value = false;
  } catch (err) {
    console.error('Error loading regions:', err);
    loading.value = false;
  }
};

// Load provinces when region is selected
const loadProvinces = async () => {
  if (!selectedRegionCode.value) return;
  
  try {
    loading.value = true;
    const data = await psgcService.getProvincesByRegion(selectedRegionCode.value);
    provinces.value = data.sort((a, b) => a.name.localeCompare(b.name));
    // Reset lower level selections
    selectedProvinceCode.value = '';
    student.address.province = '';
    student.address.municipality = '';
    student.address.barangay = '';
    municipalities.value = [];
    barangays.value = [];
    loading.value = false;
  } catch (err) {
    console.error('Error loading provinces:', err);
    loading.value = false;
  }
};

// Load municipalities when province is selected
const loadMunicipalities = async () => {
  if (!selectedProvinceCode.value) return;
  
  try {
    loading.value = true;
    const data = await psgcService.getMunicipalitiesByProvince(selectedProvinceCode.value);
    municipalities.value = data.sort((a, b) => a.name.localeCompare(b.name));
    // Reset lower level selections
    student.address.municipality = '';
    student.address.barangay = '';
    barangays.value = [];
    loading.value = false;
  } catch (err) {
    console.error('Error loading municipalities:', err);
    loading.value = false;
  }
};

// Load barangays when municipality/city is selected
const loadBarangays = async () => {
  if (!selectedMunicipalityCode.value) return;
  
  try {
    loading.value = true;
    let data;
    if (isCitySelected.value) {
      data = await psgcService.getBarangaysByCity(selectedMunicipalityCode.value);
    } else {
      data = await psgcService.getBarangaysByMunicipality(selectedMunicipalityCode.value);
    }
    barangays.value = data.sort((a, b) => a.name.localeCompare(b.name));
    student.address.barangay = '';
    loading.value = false;
  } catch (err) {
    console.error('Error loading barangays:', err);
    loading.value = false;
  }
};

// Handle region selection
const handleRegionChange = (event) => {
  const regionCode = event.target.value;
  const selectedRegion = regions.value.find(r => r.code === regionCode);
  if (selectedRegion) {
    selectedRegionCode.value = regionCode;
    student.address.region = selectedRegion.name;
    loadProvinces();
  } else {
    student.address.region = '';
    selectedRegionCode.value = '';
    provinces.value = [];
  }
};

// Handle province selection
const handleProvinceChange = (event) => {
  const provinceCode = event.target.value;
  const selectedProvince = provinces.value.find(p => p.code === provinceCode);
  if (selectedProvince) {
    selectedProvinceCode.value = provinceCode;
    student.address.province = selectedProvince.name;
    loadMunicipalities();
  } else {
    student.address.province = '';
    selectedProvinceCode.value = '';
    municipalities.value = [];
  }
};

// Handle municipality/city selection
const handleMunicipalityChange = async (event) => {
  const municipalityCode = event.target.value;
  const selectedMunicipality = municipalities.value.find(m => m.code === municipalityCode);
  
  if (selectedMunicipality) {
    selectedMunicipalityCode.value = municipalityCode;
    student.address.municipality = selectedMunicipality.name;
    isCitySelected.value = selectedMunicipality.cityClass !== undefined;
    
    try {
      await loadBarangays();
      
      // If we got no barangays even after successful call, show a message
      if (barangays.value.length === 0) {
        console.log(`No barangays found for ${selectedMunicipality.name}`);
        // You can set an informational message here if needed
        // error.value = `No barangays found for ${selectedMunicipality.name}. You can proceed with registration.`;
      }
    } catch (err) {
      console.error(`Failed to load barangays for ${selectedMunicipality.name}:`, err);
      // Clear barangays array to prevent UI confusion
      barangays.value = [];
    }
  } else {
    student.address.municipality = '';
    selectedMunicipalityCode.value = '';
    barangays.value = [];
    student.address.barangay = '';
  }
};

// Handle barangay selection
const handleBarangayChange = (event) => {
  const barangayCode = event.target.value;
  const selectedBarangay = barangays.value.find(b => b.code === barangayCode);
  if (selectedBarangay) {
    student.address.barangay = selectedBarangay.name;
  } else {
    student.address.barangay = '';
  }
};

// Reset custom address fields
const resetCustomRegion = () => {
  customAddress.region = false;
  student.address.region = '';
  selectedRegionCode.value = '';
};

const resetCustomProvince = () => {
  customAddress.province = false;
  student.address.province = '';
  selectedProvinceCode.value = '';
};

const resetCustomMunicipality = () => {
  customAddress.municipality = false;
  student.address.municipality = '';
  selectedMunicipalityCode.value = '';
};

const resetCustomBarangay = () => {
  customAddress.barangay = false;
  student.address.barangay = '';
};

// Load system options
const loadSystemOptions = async () => {
  try {
    const options = await systemOptionsService.getAll();
    systemOptions.value = options;
    console.log('System options loaded:', options);
    
    // Load available year levels from system options
    if (options.class && options.class.sections) {
      availableYearLevels.value = Object.keys(options.class.sections);
    }
  } catch (error) {
    console.error('Error loading system options:', error);
    // Fallback to default options if system options fail to load
    systemOptions.value = {
      class: {
        sections: {
          '2nd': ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'],
          '3rd': ['South-1', 'South-2', 'South-3'],
          '4th': ['South-1', 'South-2']
        },
        majors: {
          '2nd': [],
          '3rd': ['Business Informatics', 'System Development'],
          '4th': ['Business Informatics', 'System Development']
        }
      }
    };
    availableYearLevels.value = ['2nd', '3rd', '4th'];
  }
};

// Load sections based on selected year level
const loadSections = () => {
  if (!systemOptions.value || !systemOptions.value.class) {
    console.warn('System options not loaded yet');
    return;
  }
  
  const yearLevel = student.yearLevel;
  
  // Load sections from system options
  if (systemOptions.value.class.sections && systemOptions.value.class.sections[yearLevel]) {
    availableSections.value = systemOptions.value.class.sections[yearLevel];
  } else {
    availableSections.value = [];
  }
  
  // Load majors from system options
  if (systemOptions.value.class.majors && systemOptions.value.class.majors[yearLevel]) {
    availableMajors.value = systemOptions.value.class.majors[yearLevel];
  } else {
    availableMajors.value = [];
  }
  
  // Reset section and major when year level changes
  student.section = '';
  student.major = '';
  
  console.log(`Loaded for ${yearLevel}:`, {
    sections: availableSections.value,
    majors: availableMajors.value
  });
};

// Initialize PSGC dropdowns and system options
onMounted(async () => {
  try {
    // Load system options first
    await loadSystemOptions();
    // Load PSGC regions
    await loadRegions();
  } catch (err) {
    console.error('Failed to load initial data:', err);
  }
});

// Validate form data
function validateForm() {
  let isValid = true;
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  
  // Validate first name
  if (!student.firstName.trim()) {
    errors.firstName = 'First name is required';
    isValid = false;
  }
  
  // Validate last name
  if (!student.lastName.trim()) {
    errors.lastName = 'Last name is required';
    isValid = false;
  }
  
  // Validate ID number
  if (!student.idNumber.trim()) {
    errors.idNumber = 'ID number is required';
    isValid = false;
  } else if (!/^\d{2}-\d{4}-\d{5}$/.test(student.idNumber) && !/^\d{2}-\d{4}-\d{6}$/.test(student.idNumber)) {
    errors.idNumber = 'ID Number is Invalid';
    isValid = false;
  }
  
  // Validate email
  if (!student.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/.+@.+\..+/.test(student.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  } else if (!student.email.endsWith('phinmaed.com')) {
    errors.email = 'Please use your PHINMA Education email';
    isValid = false;
  }
  
  // Validate gender
  if (!student.gender) {
    errors.gender = 'Please select your gender';
    isValid = false;
  }
  
  // Validate contact number
  if (!student.contactNumber.trim()) {
    errors.contactNumber = 'Contact number is required';
    isValid = false;
  } else if (!/^9\d{9}$/.test(student.contactNumber)) {
    errors.contactNumber = 'Contact number must start with 9 and be 10 digits long';
    isValid = false;
  }
  
  // Validate year level
  if (!student.yearLevel) {
    errors.yearLevel = 'Please select your year level';
    isValid = false;
  }
  
  // Validate section
  if (!student.section) {
    errors.section = 'Please select your section';
    isValid = false;
  }
  
  // Validate major (only for 3rd and 4th year)
  if (student.yearLevel !== '2nd' && !student.major) {
    errors.major = 'Please select your major';
    isValid = false;
  }
  
  // Validate password
  if (!student.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (student.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
    isValid = false;
  } else if (!/[A-Z]/.test(student.password)) {
    errors.password = 'Password must contain at least one uppercase letter';
    isValid = false;
  } else if (!/[a-z]/.test(student.password)) {
    errors.password = 'Password must contain at least one lowercase letter';
    isValid = false;
  } else if (!/[0-9]/.test(student.password)) {
    errors.password = 'Password must contain at least one number';
    isValid = false;
  } else if (!/[!@#$%^&*]/.test(student.password)) {
    errors.password = 'Password must contain at least one special character (!@#$%^&*)';
    isValid = false;
  }
  
  // Validate confirm password
  if (!student.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (student.password !== student.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
    isValid = false;
  }
  
  // Validate address fields
  if (!student.address.region) {
    errors.addressRegion = 'Please select your region';
    isValid = false;
  }
  
  if (!student.address.province) {
    errors.addressProvince = 'Please select your province';
    isValid = false;
  }
  
  if (!student.address.municipality) {
    errors.addressMunicipality = 'Please select your municipality/city';
    isValid = false;
  }
  
  if (!student.address.barangay) {
    errors.addressBarangay = 'Please select your barangay';
    isValid = false;
  }
  
  if (!student.address.street.trim()) {
    errors.addressStreet = 'Street/Purok is required';
    isValid = false;
  }
  
  // Validate terms agreement
  if (!agreedToTerms.value) {
    errors.terms = 'You must agree to the Data Privacy Act to continue';
    isValid = false;
  }
  
  return isValid;
}

// Register student
async function registerStudent() {
  loading.value = true;
  error.value = '';
  registrationSuccess.value = false;
  
  // Validate form
  if (!validateForm()) {
    loading.value = false;
    error.value = 'Please fill in all required fields and check the terms agreement';
    return;
  }
  
  try {
    // Create student registration object
    const studentData = {
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      nameExtension: student.nameExtension,
      idNumber: student.idNumber,
      email: student.email,
      gender: student.gender,
      contactNumber: student.contactNumber,
      address: student.address,
      yearLevel: student.yearLevel,
      section: student.section,
      password: student.password
    };
    
    // Only include major if student is not 2nd year
    if (student.yearLevel !== '2nd' && student.major) {
      studentData.major = student.major;
    }
    
    // Send registration request
    const response = await api.post('/students/register', studentData);
    
    if (response.status === 201) {
      // Registration successful
      registrationSuccess.value = true;
      
      // Reset form
      Object.keys(student).forEach(key => {
        if (typeof student[key] === 'object' && student[key] !== null) {
          Object.keys(student[key]).forEach(subKey => {
            student[key][subKey] = '';
          });
        } else {
          student[key] = '';
        }
      });
      
      // Clear errors
      Object.keys(errors).forEach(key => {
        errors[key] = '';
      });
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    }
  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    } else {
      error.value = 'An error occurred during registration. Please try again.';
    }
    
    // Scroll to top to show error message
    window.scrollTo(0, 0);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.bg-primary {
  background-color: #3B82F6;
}
.bg-primary-dark {
  background-color: #2563EB;
}
.text-primary {
  color: #3B82F6;
}
.focus\:ring-primary:focus {
  --tw-ring-color: #3B82F6;
}
.focus\:border-primary:focus {
  border-color: #3B82F6;
}
.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}
</style> 
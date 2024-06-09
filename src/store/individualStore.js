import { ref, reactive } from 'vue'
import router from '../router/router'
import axios from 'axios';
const individualAuthStore = reactive({
    apiBase: 'http://localhost:8000',
    isAuthenticated: localStorage.getItem('auth') == 1,
    errors: null,
    async fetchPublicApi(endPoint = "", params = {}, requestType = "GET") {
        let request = {
            method: requestType.toUpperCase(),
            headers: {
                "Access-Control-Allow-Origin": "*",
                Accept: "application/vnd.api+json",
                "Content-Type": "application/vnd.api+json",
            },
        }

        if (requestType.toUpperCase() == "POST" || "PUT" == requestType.toUpperCase()) {
            request.body = JSON.stringify(params);
        }

        const res = await fetch(individualAuthStore.apiBase + endPoint, request);

        const response = await res.json();
        return response;
    },
    async fetchProtectedApi(endPoint = "", params = {}, requestType = "GET") {
        const token = individualAuthStore.getUserToken()
        let request = {
            method: requestType.toUpperCase(),
            headers: {
                "Access-Control-Allow-Origin": "*",
                Accept: "application/vnd.api+json",
                "Content-Type": "application/vnd.api+json",
                'Authorization': `Bearer ${token}`,
            },
        }

        if (requestType.toUpperCase() == "POST" || "PUT" == requestType.toUpperCase()) {
            request.body = JSON.stringify(params);
        }

        const res = await fetch(individualAuthStore.apiBase + endPoint, request);

        const response = await res.json();
        return response;
    },
    async uploadProtectedApi(endPoint = "", params = {}) {
        const token = individualAuthStore.getUserToken()

        const res = await axios.post(individualAuthStore.apiBase + endPoint, params, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "multipart/form-data",
                'Authorization': `Bearer ${token}`,
            }
        });

        const response = await res.data;
        return response;
    },
    individualRegister(full_name, email, password) {
        individualAuthStore.fetchPublicApi('/api/individual_register', { full_name, email: email, password: password }, 'POST')
            .then(res => {
                if (res.status) {
                    individualAuthStore.errors = null;
                    router.push('/login');
                } else {
                    individualAuthStore.errors = res.errors;
                }
            });
    },
    getUserToken() {
        return individualAuthStore.user.accessToken;
    },
    getUserType() {
        return individualAuthStore.user.type;
    }
})

export { individualAuthStore }
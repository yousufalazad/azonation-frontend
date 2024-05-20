import { ref, reactive } from 'vue'
import router from '../router/router'
import axios from 'axios';
const orgAuthStore = reactive({
    apiBase: 'http://localhost:8000',
    isAuthenticated: localStorage.getItem('auth') == 1,
    user: JSON.parse(localStorage.getItem('user')),
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

        const res = await fetch(orgAuthStore.apiBase + endPoint, request);

        const response = await res.json();
        return response;
    },
    async fetchProtectedApi(endPoint = "", params = {}, requestType = "GET") {
        const token = orgAuthStore.getUserToken()
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

        const res = await fetch(orgAuthStore.apiBase + endPoint, request);

        const response = await res.json();
        return response;
    },
    async uploadProtectedApi(endPoint = "", params = {}) {
        const token = orgAuthStore.getUserToken()

        const res = await axios.post(orgAuthStore.apiBase + endPoint, params, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "multipart/form-data",
                'Authorization': `Bearer ${token}`,
            }
        });

        const response = await res.data;
        return response;
    },
    orgRegister(org_name, email, password) {
        orgAuthStore.fetchPublicApi('/api/org_register', { org_name: org_name, email: email, password: password }, 'POST')
            .then(res => {
                if (res.status) {
                    orgAuthStore.errors = null;
                    router.push('/login');
                } else {
                    orgAuthStore.errors = res.errors;
                }
            });
    },
    // orgDetails(orgId) {
    //     orgAuthStore.fetchPublicApi('/api/organisation', { orgId: id }, 'GET')
    //         .then(res => {
                
    //             if (res.status) {
    //                 const response = await res.data;
    //                 return response;
    //             } 

    //         });
    // },
    //from chatGPT
    // async orgDetails(orgId) {
    //     try {
    //         const response = await fetch(`${orgAuthStore.apiBase}/api/organisation/${orgId}`);
    //         const data = await response.json();
    //         return data;
    //     } catch (error) {
    //         console.error("Error fetching org details:", error);
    //         return null;
    //     }
    // }
})

export { orgAuthStore }
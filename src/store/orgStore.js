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
    authenticate(username, password) {
        orgAuthStore.fetchPublicApi('/api/login', { email: username, password }, 'POST')
            .then(res => {
                if (res.status) {
                    orgAuthStore.isAuthenticated = true
                    orgAuthStore.user = res.data
                    localStorage.setItem('auth', 1)
                    localStorage.setItem('user', JSON.stringify(res.data))

                    if ('admin' == res.data.type) {
                        router.push('/admin')
                    } else {
                        router.push('/')
                    }
                }
            });
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
    logout() {
        orgAuthStore.isAuthenticated = false
        orgAuthStore.user = {}
        localStorage.setItem('auth', 0)
        localStorage.setItem('user', '{}')
        router.push('/login')
    },
    getUserToken() {
        return orgAuthStore.user.accessToken;
    },
    getUserType() {
        return orgAuthStore.user.type;
    }
})

export { orgAuthStore }
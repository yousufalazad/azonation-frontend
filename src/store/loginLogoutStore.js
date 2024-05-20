import { ref, reactive } from 'vue'
import router from '../router/router'
import axios from 'axios';
const loginAuthStore = reactive({
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

        const res = await fetch(loginAuthStore.apiBase + endPoint, request);

        const response = await res.json();
        return response;
    },
    async fetchProtectedApi(endPoint = "", params = {}, requestType = "GET") {
        const token = loginAuthStore.getUserToken()
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

        const res = await fetch(loginAuthStore.apiBase + endPoint, request);

        const response = await res.json();
        return response;
    },
    async uploadProtectedApi(endPoint = "", params = {}) {
        const token = loginAuthStore.getUserToken()

        const res = await axios.post(loginAuthStore.apiBase + endPoint, params, {
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
        loginAuthStore.fetchPublicApi('/api/login', { email: username, password: password }, 'POST')
            .then(res => {
                if (res.status) {
                    loginAuthStore.isAuthenticated = true
                    loginAuthStore.user = res.data
                    localStorage.setItem('auth', 1)
                    localStorage.setItem('user', JSON.stringify(res.data))

                    if ('1' == res.data.type) {
                        router.push('/individual-dashboard')
                    } else if ('2' == res.data.type){
                        //router.push('/org-dashboard')
                        // Pass res.data.id to org dashboard
                        router.push({ name: 'org-dashboard', params: { id: res.data.id }})
                    } else {
                        router.push('/')
                    }
                }
                
            });
    },
    logout() {
        loginAuthStore.isAuthenticated = false
        loginAuthStore.user = {}
        localStorage.setItem('auth', 0)
        localStorage.setItem('user', '{}')
        router.push('/login')
    },
    getUserToken() {
        return loginAuthStore.user.accessToken;
    },
    getUserType() {
        return loginAuthStore.user.type;
    }
})

export { loginAuthStore }
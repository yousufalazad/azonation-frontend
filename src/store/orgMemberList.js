import { ref, reactive } from 'vue'
import router from '../router/router'
import axios from 'axios';
const orgMemberListAuthStore = reactive({
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

        const res = await fetch(orgMemberListAuthStore.apiBase + endPoint, request);

        const response = await res.json();
        return response;
    },
    
    orgMemberListAdd(org_id, individual_id) {
        orgMemberListAuthStore.fetchPublicApi('/api/org_member_list', { org_id: org_id, individual_id: individual_id}, 'POST')
        console.log(org_id)
        console.log(individual_id)
            // .then(res => {
            //     if (res.status) {
            //         orgMemberListAuthStore.errors = null;
            //         //router.push({ name: "org-dashboard" });
            //     } else {
            //         orgMemberListAuthStore.errors = res.errors;
            //     }
            // });
    },
})

export { orgMemberListAuthStore }
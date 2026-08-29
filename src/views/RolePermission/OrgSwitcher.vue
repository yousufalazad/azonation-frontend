<template>
    <select v-model="auth.currentOrgId" @change="auth.switchOrg(auth.currentOrgId)">
        <option
            v-for="org in auth.orgAccess"
            :key="org.org_type_user_id"
            :value="org.org_type_user_id"
        >
            Org {{ org.org_type_user_id }}
        </option>
    </select>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
const auth = useAuthStore()

</script>
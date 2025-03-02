<template>
    <header>
        <p>Header</p>
        <nav>
            <NuxtLink to="/">Habitos</NuxtLink>
            <NuxtLink to="/track">Seguimiento Diario</NuxtLink>
        </nav>
        <button @click="signOut">Cerrar sesión</button>
    </header>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})
const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();

async function signOut() {
    try {
        const { error } = await client.auth.signOut();
        if (error) throw error;
        router.push('/login')
    } catch (error) {
        console.error(error.message)
    }
}
</script>
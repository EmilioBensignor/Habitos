<template>
    <main>
        <section v-if="user">
            <h1>Hiciste tus habitos?</h1>
            <p>Email: {{ user.email }}</p>
            <button @click="signOut">Cerrar Sesión</button>
        </section>
    </main>
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
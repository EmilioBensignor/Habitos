<template>
    <main class="authPage">
        <section class="authBox">
            <h1>Iniciar Sesión</h1>
            <form @submit.prevent="signIn">
                <div class="formGroup">
                    <label for="email">Email</label>
                    <input id="email" v-model="email" type="email" placeholder="correo@ejemplo.com" required>
                </div>
                <div class="formGroup">
                    <label for="password">Contraseña</label>
                    <input id="password" v-model="password" type="password" placeholder="Ingresa tu contraseña"
                        required>
                </div>
                <p v-if="errorMsg" class="errorMessage">{{ errorMsg }}</p>
                <button type="submit" class="primaryButton">Ingresar</button>
                <NuxtLink to="/register" class="secondaryButton no-underline">Registrarte</NuxtLink>
            </form>
        </section>
    </main>
</template>

<script setup>
definePageMeta({
    layout: 'auth',
});

const client = useSupabaseClient();
const router = useRouter();

const email = ref('')
const password = ref('')
const errorMsg = ref('')

async function signIn() {
    try {
        const { error } = await client.auth.signInWithPassword({
            email: email.value,
            password: password.value
        });
        if (error) throw error;
        router.push('/')
    } catch (error) {
        errorMsg.value = error.message
    }
}
</script>
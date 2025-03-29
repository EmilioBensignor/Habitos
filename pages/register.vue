<template>
    <main class="authPage">
        <section class="authBox">
            <h1>Registrarte</h1>
            <form @submit.prevent="signUp">
                <div class="formGroup">
                    <label for="email">Email</label>
                    <input type="email" id="email" v-model="email" required placeholder="correo@ejemplo.com">
                </div>

                <div class="formGroup">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" v-model="password" required
                        placeholder="Ingresa tu contraseña">
                </div>

                <button type="submit" class="primaryButton" :disabled="!email || !password">
                    Registrarse
                </button>
                <NuxtLink to="/login" class="secondaryButton no-underline">Iniciar sesión</NuxtLink>

                <p v-if="errorMsg" class="errorMessage">{{ errorMsg }}</p>
                <p v-if="successMsg" class="successMessage">{{ successMsg }}</p>
            </form>
        </section>
    </main>
</template>

<script setup>
definePageMeta({
    layout: 'auth',
});

const client = useSupabaseClient();
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const successMsg = ref('')

async function signUp() {
    try {
        const { data, error } = await client.auth.signUp({
            email: email.value,
            password: password.value
        });
        if (error) throw error;
        successMsg.value = 'Usuario creado exitosamente'
    } catch (error) {
        errorMsg.value = error.message
    }
}
</script>
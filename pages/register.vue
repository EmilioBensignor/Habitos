<template>
    <main class="login-container">
        <section class="login-form">
            <h1>Registrarte</h1>
            <form @submit.prevent="signUp">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" v-model="email" required placeholder="correo@ejemplo.com">
                </div>

                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" v-model="password" required
                        placeholder="Ingresa tu contraseña">
                </div>

                <button type="submit" :disabled="!email || !password">
                    Registrarse
                </button>
                <NuxtLink to="/login" class="no-underline">Iniciar sesión</NuxtLink>

                <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>
                <p v-if="successMsg" style="color: green; margin-top: 0.5rem;">{{ successMsg }}</p>
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

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
}

.login-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    font-weight: bold;
}

form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.form-group {
    width: 100%;
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
}

input {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
    margin-bottom: 1rem;
}

button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 1rem;
}

button:hover {
    background-color: #45a049;
}

.error-message {
    color: #dc3545;
    margin-top: 0.5rem;
    font-size: 0.875rem;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}
</style>

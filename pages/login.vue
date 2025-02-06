<template>
    <main class="login-container">
        <section class="login-form">
            <h2>Iniciar sesión</h2>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        v-model="email" 
                        required
                    >
                </div>
                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input 
                        type="password" 
                        id="password" 
                        v-model="password" 
                        required
                    >
                </div>
                <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
                <button type="submit" :disabled="loading">
                    {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
                </button>
            </form>
        </section>
    </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '~/utils/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
    try {
        loading.value = true
        errorMessage.value = ''
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value
        })

        if (error) throw error

        // Login exitoso
        router.push('/dashboard')
    } catch (error) {
        errorMessage.value = error.message || 'Error al iniciar sesión'
    } finally {
        loading.value = false
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
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 400px;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
}

input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
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
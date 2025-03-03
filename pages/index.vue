<!-- pages/habits.vue -->
<template>
    <div class="habits-page">
        <h1>Mis Hábitos</h1>

        <div v-if="showForm" class="form-container">
            <h2>{{ currentHabit.id ? 'Editar' : 'Crear nuevo' }} hábito</h2>
            <HabitForm :habit="currentHabit" @saved="habitSaved" @cancel="cancelForm" />
        </div>

        <div v-else class="columnAlignCenter">
            <button @click="showCreateForm" class="create-btn">
                Crear nuevo hábito
            </button>

            <NuxtLink to="/track">Seguimiento Diario</NuxtLink>

            <HabitList @edit="showEditForm" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

// Configurar estado para mostrar/ocultar formulario
const showForm = ref(false)
const currentHabit = ref({
    name: '',
    description: '',
    frequency: 'daily'
})

// Mostrar formulario para crear nuevo hábito
const showCreateForm = () => {
    currentHabit.value = {
        name: '',
        description: '',
        frequency: 'daily'
    }
    showForm.value = true
}

// Mostrar formulario para editar hábito existente
const showEditForm = (habit) => {
    currentHabit.value = { ...habit }
    showForm.value = true
}

// Manejar guardar hábito
const habitSaved = () => {
    showForm.value = false
    // Recargar la página para mostrar los cambios
    window.location.reload()
}

// Cancelar formulario
const cancelForm = () => {
    showForm.value = false
}
</script>

<style scoped>
.habits-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.create-btn {
    display: block;
    margin: 20px 0;
    padding: 12px 24px;
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.form-container {
    background-color: #f8fafc;
    border-radius: 12px;
    padding: 24px;
    margin: 20px 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
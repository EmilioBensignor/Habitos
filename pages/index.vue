<!-- pages/index.vue -->
<template>
    <div class="habits-page">
        <h1>Mis Hábitos</h1>

        <div v-if="showForm" class="form-container">
            <h2>{{ currentHabit.id ? 'Editar' : 'Crear nuevo' }} hábito</h2>
            <HabitForm :habit="currentHabit" @saved="habitSaved" @cancel="cancelForm" />
        </div>

        <div v-else class="habits-container">
            <div class="actions-header">
                <button @click="showCreateForm" class="create-btn">
                    <span class="icon">+</span> Crear nuevo hábito
                </button>
                <div class="filters">
                    <select v-model="filterOption" class="filter-select">
                        <option value="all">Todos los hábitos</option>
                        <option value="pending">Pendientes hoy</option>
                        <option value="completed">Completados hoy</option>
                    </select>
                </div>
            </div>

            <div v-if="loading" class="loading">
                <p>Cargando hábitos...</p>
            </div>

            <div v-else-if="filteredHabits.length === 0" class="empty-state">
                <p v-if="habits.length === 0">No tienes hábitos creados. ¡Comienza creando uno nuevo!</p>
                <p v-else>No hay hábitos que coincidan con el filtro seleccionado.</p>
            </div>

            <div v-else class="habits-grid">
                <HabitCard v-for="habit in filteredHabits" :key="habit.id" :habit="habit" @edit="showEditForm"
                    @delete="deleteHabitItem" @refresh="refreshHabits" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useHabits } from '~/composables/useHabits'

const { getHabits, deleteHabit, getTodayHabits } = useHabits()
const habits = ref([])
const loading = ref(true)
const filterOption = ref('all')

// Configurar estado para mostrar/ocultar formulario
const showForm = ref(false)
const currentHabit = ref({
    name: '',
    description: '',
    frequency: 'daily'
})

// Filtrar hábitos según la opción seleccionada
const filteredHabits = computed(() => {
    if (filterOption.value === 'all') {
        return habits.value
    } else if (filterOption.value === 'pending') {
        return habits.value.filter(habit => habit.dueToday && !habit.completedToday)
    } else if (filterOption.value === 'completed') {
        return habits.value.filter(habit => habit.completedToday)
    }
    return habits.value
})

// Cargar hábitos
const loadHabits = async () => {
    loading.value = true
    try {
        habits.value = await getTodayHabits()
    } catch (error) {
        console.error('Error al cargar hábitos:', error)
    } finally {
        loading.value = false
    }
}

// Cargar hábitos al montar el componente
onMounted(loadHabits)

// Recargar hábitos (para cuando cambia el estado de completado)
const refreshHabits = async () => {
    await loadHabits()
}

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
const habitSaved = async () => {
    showForm.value = false
    // Recargar los hábitos
    await loadHabits()
}

// Cancelar formulario
const cancelForm = () => {
    showForm.value = false
}

// Eliminar hábito
const deleteHabitItem = async (id) => {
    if (confirm('¿Estás seguro que deseas eliminar este hábito?')) {
        try {
            await deleteHabit(id)
            // Recargar hábitos para actualizar la lista
            await loadHabits()
        } catch (error) {
            console.error('Error al eliminar hábito:', error)
        }
    }
}
</script>

<style scoped>
.habits-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    margin-bottom: 24px;
    color: #111827;
}

.actions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.create-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
}

.icon {
    font-size: 18px;
    font-weight: bold;
}

.filter-select {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background-color: white;
    font-size: 14px;
    color: #111827;
}

.form-container {
    background-color: #f8fafc;
    border-radius: 12px;
    padding: 24px;
    margin: 20px 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.habits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.loading,
.empty-state {
    text-align: center;
    margin-top: 40px;
    color: #4b5563;
}
</style>
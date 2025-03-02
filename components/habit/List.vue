<!-- components/HabitList.vue -->
<template>
    <div>
        <div v-if="loading" class="loading">
            <p>Cargando hábitos...</p>
        </div>
        <div v-else-if="habits.length === 0" class="empty-state">
            <p>No tienes hábitos creados. ¡Comienza creando uno nuevo!</p>
        </div>
        <div v-else class="habits-container">
            <div v-for="habit in habits" :key="habit.id" class="habit-card">
                <h3>{{ habit.name }}</h3>
                <p v-if="habit.description">{{ habit.description }}</p>
                <p>Frecuencia: {{ habit.frequency }}</p>
                <div class="actions">
                    <button @click="editHabit(habit)">Editar</button>
                    <button @click="confirmDelete(habit.id)" class="delete">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHabits } from '~/composables/useHabits'

const { getHabits, deleteHabit } = useHabits()
const habits = ref([])
const loading = ref(true)

// Cargar hábitos al montar el componente
onMounted(async () => {
    try {
        habits.value = await getHabits()
    } catch (error) {
        console.error('Error al cargar hábitos:', error)
    } finally {
        loading.value = false
    }
})

// Emitir evento para editar hábito
const emit = defineEmits(['edit'])

const editHabit = (habit) => {
    emit('edit', habit)
}

// Función para confirmar y eliminar un hábito
const confirmDelete = async (id) => {
    if (confirm('¿Estás seguro que deseas eliminar este hábito?')) {
        try {
            await deleteHabit(id)
            // Remover el hábito eliminado del array local
            habits.value = habits.value.filter(habit => habit.id !== id)
        } catch (error) {
            console.error('Error al eliminar hábito:', error)
        }
    }
}
</script>

<style scoped>
.habits-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.habit-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
}

button {
    padding: 6px 12px;
    border-radius: 4px;
    background-color: #4f46e5;
    color: white;
    border: none;
    cursor: pointer;
}

button.delete {
    background-color: #ef4444;
}

.loading,
.empty-state {
    text-align: center;
    margin-top: 40px;
}
</style>
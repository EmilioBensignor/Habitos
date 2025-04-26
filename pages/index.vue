<template>
    <section class="habitsPage">
        <div class="columnAlignCenter">
            <h1>Mis Hábitos</h1>
            // Poder ver un dia anterior
            // Pensar sables de luz
            <div v-if="showForm" class="formContainer">
                <h2>{{ currentHabit.id ? 'Editar' : 'Crear nuevo' }} hábito</h2>
                <HabitForm :habit="currentHabit" @saved="habitSaved" @cancel="cancelForm" />
            </div>

            <div v-else class="habitsContainer column">
                <div class="actionsHeader center">
                    <button @click="showCreateForm" class="createBtn">
                        <span class="icon">+</span> Crear nuevo hábito
                    </button>
                    <div class="filters">
                        <select v-model="filterOption" class="filterSelect">
                            <option value="all">Todos los hábitos</option>
                            <option value="pending">Pendientes hoy</option>
                            <option value="completed">Completados hoy</option>
                        </select>
                    </div>
                </div>

                <div v-if="loading" class="loadingContainer">
                    <p>Cargando hábitos...</p>
                </div>

                <div v-else-if="filteredHabits.length === 0" class="emptyState">
                    <p v-if="habits.length === 0">No tienes hábitos creados. ¡Comienza creando uno nuevo!</p>
                    <p v-else>No hay hábitos que coincidan con el filtro seleccionado.</p>
                </div>

                <div v-else class="habitsContainer columnAlignCenter">
                    <HabitCard v-for="habit in filteredHabits" :key="habit.id" :habit="habit" @edit="showEditForm"
                        @delete="deleteHabitItem" @refresh="refreshHabits" />
                </div>
            </div>
        </div>
    </section>
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
.habitsContainer {
    gap: 2rem;
}

.actionsHeader {
    gap: 2rem;
}
</style>
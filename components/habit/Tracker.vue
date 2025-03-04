<!-- components/HabitTracker.vue -->
<template>
    <div class="habit-tracker columnAlignCenter">
        <h2>Seguimiento de Hábitos</h2>

        <NuxtLink to="/">Habitos</NuxtLink>

        <div v-if="loading" class="loading">
            <p>Cargando hábitos...</p>
        </div>

        <div v-else class="habits-grid">
            <div v-for="habit in habits" :key="habit.id" class="habit-card">
                <div class="habit-info">
                    <h3>{{ habit.name }}</h3>
                    <p>{{ habit.frequency }}</p>
                </div>

                <div class="habit-actions">
                    <button @click="completeHabit(habit.id)" :disabled="isCompleted(habit.id)" class="complete-btn">
                        {{ isCompleted(habit.id) ? 'Completado hoy' : 'Completar' }}
                    </button>

                    <button @click="showStats(habit.id)" class="stats-btn">
                        Ver estadísticas
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal para estadísticas (simplificado) -->
        <div v-if="showStatsModal" class="modal">
            <div class="modal-content">
                <h3>Estadísticas de {{ currentHabit?.name }}</h3>

                <div v-if="loadingStats" class="loading">
                    Cargando estadísticas...
                </div>

                <div v-else-if="stats" class="stats">
                    <div class="stat-box">
                        <span class="stat-value">{{ stats.completionRate.toFixed(0) }}%</span>
                        <span class="stat-label">Tasa de completado</span>
                    </div>

                    <div class="stat-box">
                        <span class="stat-value">{{ stats.streakCurrent }}</span>
                        <span class="stat-label">Racha actual</span>
                    </div>

                    <div class="stat-box">
                        <span class="stat-value">{{ stats.streakLongest }}</span>
                        <span class="stat-label">Mejor racha</span>
                    </div>
                </div>

                <button @click="closeStats" class="close-btn">Cerrar</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHabits } from '~/composables/useHabits'

const { getHabits, trackHabit, getHabitLogs, getHabitStats } = useHabits()
const habits = ref([])
const loading = ref(true)
const completedToday = ref({}) // Mapa de hábitos completados hoy

// Estadísticas
const showStatsModal = ref(false)
const currentHabit = ref(null)
const stats = ref(null)
const loadingStats = ref(false)

// Cargar hábitos y verificar cuáles han sido completados hoy
onMounted(async () => {
    try {
        // Cargar todos los hábitos
        habits.value = await getHabits()

        // Comprobar cuáles han sido completados hoy
        const today = new Date().toISOString().split('T')[0]

        // Para cada hábito, verificar si tiene registros de hoy
        for (const habit of habits.value) {
            const logs = await getHabitLogs(habit.id, `${today}T00:00:00Z`, `${today}T23:59:59Z`)
            completedToday.value[habit.id] = logs.length > 0
        }
    } catch (error) {
        console.error('Error al cargar hábitos:', error)
    } finally {
        loading.value = false
    }
})

// Verificar si un hábito ha sido completado hoy
const isCompleted = (habitId) => {
    return completedToday.value[habitId] || false
}

// Marcar un hábito como completado
const completeHabit = async (habitId) => {
    try {
        await trackHabit(habitId)
        // Actualizar estado local
        completedToday.value[habitId] = true
    } catch (error) {
        console.error('Error al completar hábito:', error)
        alert('Ocurrió un error al registrar el hábito')
    }
}

// Mostrar estadísticas de un hábito
const showStats = async (habitId) => {
    currentHabit.value = habits.value.find(h => h.id === habitId)
    showStatsModal.value = true
    loadingStats.value = true

    try {
        stats.value = await getHabitStats(habitId)
    } catch (error) {
        console.error('Error al cargar estadísticas:', error)
    } finally {
        loadingStats.value = false
    }
}

// Cerrar modal de estadísticas
const closeStats = () => {
    showStatsModal.value = false
    currentHabit.value = null
    stats.value = null
}
</script>

<style scoped>
.habit-tracker {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h2 {
    margin-bottom: 24px;
    text-align: center;
}

.habits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.habit-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.habit-actions {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

button {
    padding: 10px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
}

.complete-btn {
    background-color: #10b981;
    color: white;
}

.complete-btn:disabled {
    background-color: #d1fae5;
    cursor: not-allowed;
}

.stats-btn {
    background-color: #3b82f6;
    color: white;
}

/* Modal styles */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 24px;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
}

.stats {
    display: flex;
    justify-content: space-between;
    margin: 24px 0;
}

.stat-box {
    text-align: center;
    padding: 16px;
    border-radius: 8px;
    background-color: #f8fafc;
    flex: 1;
    margin: 0 8px;
}

.stat-value {
    display: block;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
}

.close-btn {
    width: 100%;
    margin-top: 16px;
    background-color: #6b7280;
    color: white;
}
</style>
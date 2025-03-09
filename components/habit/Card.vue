<!-- components/HabitCard.vue -->
<template>
    <div class="habit-card">
        <!-- Sección de información del hábito -->
        <div class="habit-info">
            <h3>{{ habit.name }}</h3>
            <p v-if="habit.description">{{ habit.description }}</p>
            <p class="frequency">Frecuencia: {{ habit.frequency }}</p>
        </div>

        <!-- Sección de trackeo del hábito -->
        <div class="habit-tracking">
            <div class="tracking-header">
                <h4>Seguimiento diario</h4>
            </div>
            <button v-if="!isCompletedToday" @click="completeHabit" class="complete-btn">
                Completar
            </button>
            <div v-else class="completion-actions">
                <button class="completed-indicator">
                    Completado hoy
                </button>
                <button @click="undoCompletion" class="undo-btn" title="Deshacer completado">
                    Deshacer
                </button>
            </div>
        </div>

        <!-- Sección de estadísticas del hábito -->
        <div v-if="stats" class="habit-stats">
            <div class="stats-header">
                <h4>Estadísticas (últimos 30 días)</h4>
            </div>
            <div class="stats-container">
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
        </div>

        <!-- Sección de acciones del hábito -->
        <div class="habit-actions">
            <button @click="$emit('edit', habit)" class="edit-btn">Editar</button>
            <button @click="$emit('delete', habit.id)" class="delete-btn">Eliminar</button>
        </div>

        <!-- Indicador de carga -->
        <div v-if="loading" class="loading-overlay">
            <p>Cargando...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHabits } from '~/composables/useHabits'

// Props
const props = defineProps({
    habit: {
        type: Object,
        required: true
    }
})

// Emits
const emit = defineEmits(['edit', 'delete', 'refresh'])

// Estado
const loading = ref(false)
const isCompletedToday = ref(false)
const stats = ref(null)

// Composable de hábitos
const { trackHabit, getHabitLogs, getHabitStats, deleteHabitLog } = useHabits()

// Para almacenar el ID del log cuando completamos hoy
const todayLogId = ref(null);

// Al montar el componente, verificar si el hábito ha sido completado hoy y cargar estadísticas
onMounted(async () => {
    loading.value = true
    try {
        await checkCompletionStatus()
        await loadHabitStats()
    } catch (error) {
        console.error('Error al cargar datos del hábito:', error)
    } finally {
        loading.value = false
    }
})

// Verificar si el hábito ha sido completado hoy
const checkCompletionStatus = async () => {
    const today = new Date().toISOString().split('T')[0]
    try {
        const logs = await getHabitLogs(
            props.habit.id,
            `${today}T00:00:00Z`,
            `${today}T23:59:59Z`
        )
        isCompletedToday.value = logs.length > 0
        // Si hay un log para hoy, guardamos su ID para poder eliminarlo después si es necesario
        if (logs.length > 0) {
            todayLogId.value = logs[0].id
        }
    } catch (error) {
        console.error('Error al verificar estado de completado:', error)
    }
}

// Cargar estadísticas del hábito
const loadHabitStats = async () => {
    try {
        // Por defecto, usamos timeRange de 30 días para mantener consistencia con tu composable
        stats.value = await getHabitStats(props.habit.id, 30)
    } catch (error) {
        console.error('Error al cargar estadísticas:', error)
    }
}

// Completar hábito
const completeHabit = async () => {
    loading.value = true
    try {
        // Pasamos notas vacías como segundo parámetro, según la firma del método en tu composable
        const result = await trackHabit(props.habit.id, '')
        isCompletedToday.value = true
        // Guardamos el ID del log recién creado
        if (result && result.id) {
            todayLogId.value = result.id
        }
        // Recargamos las estadísticas después de completar
        await loadHabitStats()

        // Emitimos evento para que el padre pueda recargar todos los hábitos
        emit('refresh')
    } catch (error) {
        console.error('Error al completar hábito:', error)
        alert('Ocurrió un error al registrar el hábito')
    } finally {
        loading.value = false
    }
}

// Deshacer completado
const undoCompletion = async () => {
    if (!todayLogId.value) {
        alert('No se puede deshacer porque no se encontró el registro')
        return
    }

    loading.value = true
    try {
        await deleteHabitLog(todayLogId.value)
        isCompletedToday.value = false
        todayLogId.value = null
        // Recargamos las estadísticas después de deshacer
        await loadHabitStats()

        // Emitimos evento para que el padre pueda recargar todos los hábitos
        emit('refresh')
    } catch (error) {
        console.error('Error al deshacer completado:', error)
        alert('Ocurrió un error al deshacer el registro del hábito')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.habit-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    background-color: white;
}

.habit-info h3 {
    margin-top: 0;
    margin-bottom: 8px;
}

.frequency {
    color: #666;
    font-size: 0.9em;
}

.habit-tracking,
.habit-stats {
    border-top: 1px solid #e2e8f0;
    padding-top: 16px;
}

.tracking-header,
.stats-header {
    margin-bottom: 12px;
}

.tracking-header h4,
.stats-header h4 {
    margin: 0;
    color: #4f46e5;
}

.complete-btn {
    width: 100%;
    padding: 10px;
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.completion-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.completed-indicator {
    flex: 1;
    padding: 10px;
    background-color: #d1fae5;
    color: #047857;
    border: none;
    border-radius: 6px;
    cursor: default;
}

.undo-btn {
    padding: 10px;
    background-color: #f87171;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
}

.stats-container {
    display: flex;
    justify-content: space-between;
    gap: 10px;
}

.stat-box {
    flex: 1;
    text-align: center;
    padding: 10px;
    background-color: #f8fafc;
    border-radius: 6px;
}

.stat-value {
    display: block;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 4px;
}

.stat-label {
    display: block;
    font-size: 12px;
    color: #666;
}

.habit-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
}

.edit-btn,
.delete-btn {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.edit-btn {
    background-color: #4f46e5;
    color: white;
}

.delete-btn {
    background-color: #ef4444;
    color: white;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    z-index: 10;
}
</style>
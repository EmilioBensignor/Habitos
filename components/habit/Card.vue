<template>
    <div class="habitCard column">
        <!-- Sección de información del hábito -->
        <div class="habitInfo column">
            <h3 class="text-left">{{ habit.name }}</h3>
            <p v-if="habit.description">{{ habit.description }}</p>
            <p class="frequency">Frecuencia: {{ habit.frequency }}</p>
        </div>

        <!-- Sección de trackeo del hábito -->
        <div class="habitTracking column">
            <div class="trackingHeader">
                <h4>Seguimiento diario</h4>
            </div>
            <button v-if="!isCompletedToday" @click="completeHabit" class="completeBtn">
                Completar
            </button>
            <div v-else class="completionActions">
                <button class="completedIndicator">
                    Completado hoy
                </button>
                <button @click="undoCompletion" class="undoBtn" title="Deshacer completado">
                    Deshacer
                </button>
            </div>
        </div>

        <!-- Sección de estadísticas del hábito -->
        <div v-if="stats" class="habitStats column">
            <div class="statsHeader">
                <h4>Estadísticas (últimos 30 días)</h4>
            </div>
            <div class="statsContainer">
                <div class="statBox">
                    <span class="statValue">{{ stats.completionRate.toFixed(0) }}%</span>
                    <span class="statLabel">Tasa de completado</span>
                </div>

                <div class="statBox">
                    <span class="statValue">{{ stats.streakCurrent }}</span>
                    <span class="statLabel">Racha actual</span>
                </div>

                <div class="statBox">
                    <span class="statValue">{{ stats.streakLongest }}</span>
                    <span class="statLabel">Mejor racha</span>
                </div>
            </div>
        </div>

        <!-- Sección de acciones del hábito -->
        <div class="habitActions">
            <button @click="$emit('edit', habit)" class="editBtn">Editar</button>
            <button @click="$emit('delete', habit.id)" class="deleteBtn">Eliminar</button>
        </div>

        <!-- Indicador de carga -->
        <div v-if="loading" class="loadingOverlay">
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
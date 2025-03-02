// composables/useHabits.js
import { useSupabaseClient, useSupabaseUser } from '#imports'

export const useHabits = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    // Obtener todos los hábitos del usuario actual
    const getHabits = async () => {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    // Crear un nuevo hábito
    const createHabit = async (habit) => {
        // Aseguramos que el hábito esté asociado al usuario actual
        const newHabit = {
            ...habit,
            user_id: user.value.id
        }

        const { data, error } = await supabase
            .from('habits')
            .insert(newHabit)
            .select()

        if (error) throw error
        return data[0]
    }

    // Actualizar un hábito existente
    const updateHabit = async (id, updates) => {
        const { data, error } = await supabase
            .from('habits')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()

        if (error) throw error
        return data[0]
    }

    // Eliminar un hábito
    const deleteHabit = async (id) => {
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }

    // Marcar un hábito como completado
    const trackHabit = async (habitId, notes = '') => {
        const { data, error } = await supabase
            .from('habit_logs')
            .insert({
                habit_id: habitId,
                user_id: user.value.id,
                notes
            })
            .select()

        if (error) throw error
        return data[0]
    }

    // Obtener historial de seguimiento para un hábito específico
    const getHabitLogs = async (habitId, startDate, endDate) => {
        let query = supabase
            .from('habit_logs')
            .select('*')
            .eq('habit_id', habitId)
            .order('completed_at', { ascending: false })

        if (startDate) {
            query = query.gte('completed_at', startDate)
        }

        if (endDate) {
            query = query.lte('completed_at', endDate)
        }

        const { data, error } = await query

        if (error) throw error
        return data
    }

    // Eliminar un registro de seguimiento
    const deleteHabitLog = async (logId) => {
        const { error } = await supabase
            .from('habit_logs')
            .delete()
            .eq('id', logId)

        if (error) throw error
        return true
    }

    // Obtener estadísticas de hábitos
    const getHabitStats = async (habitId, timeRange = 30) => {
        // Calcular fecha de inicio (por defecto, últimos 30 días)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - timeRange)

        // Obtener logs en este período
        const logs = await getHabitLogs(habitId, startDate.toISOString())

        // Agrupar por día
        const logsByDay = {}
        logs.forEach(log => {
            const date = new Date(log.completed_at).toISOString().split('T')[0]
            if (!logsByDay[date]) {
                logsByDay[date] = []
            }
            logsByDay[date].push(log)
        })

        // Calcular estadísticas
        return {
            totalDays: timeRange,
            completedDays: Object.keys(logsByDay).length,
            completionRate: (Object.keys(logsByDay).length / timeRange) * 100,
            streakCurrent: calculateCurrentStreak(logsByDay),
            streakLongest: calculateLongestStreak(logsByDay)
        }
    }

    // Obtener estadísticas generales de todos los hábitos
    const getAllHabitsStats = async (timeRange = 30) => {
        // Obtener todos los hábitos
        const habits = await getHabits()

        // Obtener estadísticas para cada hábito
        const statsPromises = habits.map(habit => getHabitStats(habit.id, timeRange))
        const allStats = await Promise.all(statsPromises)

        // Combinar resultados
        const result = habits.map((habit, index) => ({
            ...habit,
            stats: allStats[index]
        }))

        // Calcular estadísticas generales
        const totalCompletions = allStats.reduce((sum, stat) => sum + stat.completedDays, 0)
        const totalPossible = habits.length * timeRange
        const overallCompletionRate = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0

        return {
            habits: result,
            overallStats: {
                totalHabits: habits.length,
                overallCompletionRate
            }
        }
    }

    // Funciones helper para cálculo de rachas
    const calculateCurrentStreak = (logsByDay) => {
        let streak = 0
        const today = new Date().toISOString().split('T')[0]

        // Comprobar si completado hoy
        if (logsByDay[today]) {
            streak = 1

            // Comprobar días anteriores
            let currentDate = new Date()

            while (true) {
                currentDate.setDate(currentDate.getDate() - 1)
                const dateStr = currentDate.toISOString().split('T')[0]

                if (logsByDay[dateStr]) {
                    streak++
                } else {
                    break
                }
            }
        } else {
            // Si no se completó hoy, revisar si se completó ayer y días anteriores
            let currentDate = new Date()
            currentDate.setDate(currentDate.getDate() - 1) // Empezar desde ayer

            while (true) {
                const dateStr = currentDate.toISOString().split('T')[0]

                if (logsByDay[dateStr]) {
                    streak++
                    currentDate.setDate(currentDate.getDate() - 1)
                } else {
                    break
                }
            }
        }

        return streak
    }

    const calculateLongestStreak = (logsByDay) => {
        const dates = Object.keys(logsByDay).sort()

        if (dates.length === 0) return 0
        if (dates.length === 1) return 1

        let longestStreak = 1
        let currentStreak = 1

        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1])
            const currDate = new Date(dates[i])

            // Calculamos diferencia en días
            const diffTime = Math.abs(currDate - prevDate)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays === 1) {
                // Días consecutivos
                currentStreak++
            } else {
                // Racha interrumpida
                longestStreak = Math.max(longestStreak, currentStreak)
                currentStreak = 1
            }
        }

        // Comprobar la última racha
        longestStreak = Math.max(longestStreak, currentStreak)

        return longestStreak
    }

    // Función para obtener un hábito específico por su ID
    const getHabitById = async (habitId) => {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('id', habitId)
            .single()

        if (error) throw error
        return data
    }

    // Función para obtener los hábitos que deben realizarse hoy
    // (basado en la frecuencia y el último registro)
    const getTodayHabits = async () => {
        // Primero obtenemos todos los hábitos
        const habits = await getHabits()

        // Para cada hábito, verificamos si debe realizarse hoy
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        const result = []

        for (const habit of habits) {
            // Obtenemos el último registro
            const logs = await getHabitLogs(
                habit.id,
                null,
                `${todayStr}T23:59:59Z`
            )

            // Verificamos si ya se completó hoy
            const completedToday = logs.some(log => {
                const logDate = new Date(log.completed_at).toISOString().split('T')[0]
                return logDate === todayStr
            })

            // Si ya se completó, añadimos la información
            if (completedToday) {
                result.push({
                    ...habit,
                    dueToday: false,
                    completedToday: true
                })
                continue
            }

            // Si no se completó, verificamos si debe realizarse hoy según frecuencia
            let dueToday = false

            switch (habit.frequency) {
                case 'daily':
                    dueToday = true
                    break

                case 'weekly':
                    // Si no hay logs o el último es de hace más de 7 días
                    if (logs.length === 0) {
                        dueToday = true
                    } else {
                        const lastLog = logs[0]
                        const lastDate = new Date(lastLog.completed_at)
                        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
                        dueToday = diffDays >= 7
                    }
                    break

                case 'monthly':
                    // Si no hay logs o el último es de hace más de 30 días
                    if (logs.length === 0) {
                        dueToday = true
                    } else {
                        const lastLog = logs[0]
                        const lastDate = new Date(lastLog.completed_at)
                        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
                        dueToday = diffDays >= 30
                    }
                    break
            }

            result.push({
                ...habit,
                dueToday,
                completedToday: false
            })
        }

        return result
    }

    return {
        getHabits,
        createHabit,
        updateHabit,
        deleteHabit,
        trackHabit,
        getHabitLogs,
        deleteHabitLog,
        getHabitStats,
        getAllHabitsStats,
        getHabitById,
        getTodayHabits
    }
}
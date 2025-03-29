<!-- components/HabitForm.vue -->
<template>
    <form @submit.prevent="submitForm">
        <div class="formGroup">
            <label for="name">Nombre del hábito</label>
            <input id="name" v-model="form.name" type="text" required placeholder="Ej: Meditar">
        </div>

        <div class="formGroup">
            <label for="description">Descripción (opcional)</label>
            <textarea id="description" v-model="form.description" placeholder="Describe tu hábito"></textarea>
        </div>

        <div class="formGroup">
            <label>Frecuencia</label>
            <select v-model="form.frequency" required>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
            </select>
        </div>

        <div class="formActions">
            <button type="button" class="secondaryButton" @click="$emit('cancel')">Cancelar</button>
            <button type="submit" class="primaryButton">{{ isEdit ? 'Actualizar' : 'Crear' }}</button>
        </div>
    </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useHabits } from '~/composables/useHabits'

const props = defineProps({
    habit: {
        type: Object,
        default: () => ({
            name: '',
            description: '',
            frequency: 'daily'
        })
    }
})

const emit = defineEmits(['saved', 'cancel'])
const { createHabit, updateHabit } = useHabits()

// Crear una copia del hábito proporcionado o usar valores predeterminados
const form = ref({
    name: props.habit.name,
    description: props.habit.description || '',
    frequency: props.habit.frequency || 'daily'
})

// Determinar si estamos editando o creando
const isEdit = computed(() => Boolean(props.habit.id))

// Actualizar el formulario si el prop cambia
watch(() => props.habit, (newHabit) => {
    form.value = {
        name: newHabit.name,
        description: newHabit.description || '',
        frequency: newHabit.frequency || 'daily'
    }
}, { deep: true })

// Manejar el envío del formulario
const submitForm = async () => {
    try {
        let result

        if (isEdit.value) {
            // Actualizar hábito existente
            result = await updateHabit(props.habit.id, form.value)
        } else {
            // Crear nuevo hábito
            result = await createHabit(form.value)
        }

        // Emitir evento con el resultado
        emit('saved', result)

        // Limpiar formulario si es creación
        if (!isEdit.value) {
            form.value = {
                name: '',
                description: '',
                frequency: 'daily'
            }
        }
    } catch (error) {
        console.error('Error al guardar hábito:', error)
        alert('Ocurrió un error al guardar el hábito')
    }
}
</script>
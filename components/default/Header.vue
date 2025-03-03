<template>
    <header>
        <div class="relative">
            <h1>Habitos</h1>
            <button @click="signOut" class="signOut allCenter">
                <Icon name="tabler:power" />
            </button>
        </div>
    </header>
</template>

<script setup>
const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();

async function signOut() {
    try {
        const { error } = await client.auth.signOut();
        if (error) throw error;
        router.push('/login')
    } catch (error) {
        console.error(error.message)
    }
}
</script>

<style scoped>
.signOut {
    position: absolute;
    top: 50%;
    right: 1.5rem;
    transform: translateY(-50%);
    border: none;
    background: none;
    cursor: pointer;
}

.signOut span {
    color: red;
    font-size: 1.25rem !important;
}
</style>
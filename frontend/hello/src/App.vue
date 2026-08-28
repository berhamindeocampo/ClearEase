<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import Login from './components/Login.vue'
</script>

<template>
  <main>
    <Login ref ="login"/>
    <Sidebar ref="sidebar" />
  </main>
</template>
<script setup lang="ts">
const { schoolId, schoolName } = defineProps(['schoolId', 'schoolName'])
</script>

<template>
  <div>
    <SchoolsActiveTasks :schoolId="schoolId" />
    <SchoolsCalendarHistory :schoolId="schoolId" :schoolName="schoolName" />
  </div>
</template>

<template>
  <UButton
    v-if="$route.path === '/'"
    to="/docs/installation"
    color="primary"
    size="sm"
    class="hidden lg:inline-flex"
  >
    Get Started
  </UButton>
</template>

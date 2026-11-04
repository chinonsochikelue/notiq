<template>
  <UButton
    v-if="$route.path === '/'"
    to="/docs/getting-started/quickstart"
    color="primary"
    size="sm"
    class="hidden lg:inline-flex"
  >
    Get Started
  </UButton>
</template>

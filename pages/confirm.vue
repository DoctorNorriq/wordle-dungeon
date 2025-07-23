<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const password = ref("");
const confirmPassword = ref("");
const passwordError = ref("");
const successMessage = ref("");
const isLoading = ref(false);
const showPasswordForm = ref(false);

// Check if we need to show password form
onMounted(async () => {
  // We need to check for auth state changes to detect password recovery or email confirmation
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN") {
      if (session?.user?.app_metadata?.provider === "email") {
        // User signed in with magic link (email OTP)
        // We should prompt them to set a password
        showPasswordForm.value = true;
      } else {
        // User signed in with password or OAuth
        // Redirect to home page
        navigateTo("/");
      }
    }
  });
});

// Password validation
const passwordValid = computed(() => {
  return password.value.length >= 8;
});

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value;
});

const setPassword = async () => {
  if (!passwordValid.value) {
    passwordError.value = "Password must be at least 8 characters long.";
    return;
  }

  if (!passwordsMatch.value) {
    passwordError.value = "Passwords do not match.";
    return;
  }

  isLoading.value = true;
  passwordError.value = "";

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: password.value,
    });

    if (error) {
      passwordError.value =
        error.message || "Failed to set password. Please try again.";
    } else {
      successMessage.value =
        "Password set successfully! Redirecting you to the dungeon...";
      setTimeout(() => {
        navigateTo("/");
      }, 2000);
    }
  } catch (error) {
    console.error("Error setting password:", error);
    passwordError.value = "An unexpected error occurred. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Watch for user authentication
watch(
  user,
  () => {
    if (user.value && !showPasswordForm.value) {
      // If user is authenticated and we don't need to show password form
      // Redirect to protected page
      navigateTo("/");
    }
  },
  { immediate: true }
);
</script>

<template>
  <section
    class="text-center column-flex relative h-full items-center max-w-[600px] gap-4 justify-center"
  >
    <div v-if="!user">
      <h1>Entering the dungeon...</h1>
      <p>Please wait while we verify your email.</p>
    </div>

    <div v-else-if="showPasswordForm">
      <h1>Almost there, wordsmith!</h1>
      <p>Set a password to secure your account.</p>

      <div class="mt-4 flex flex-col gap-4">
        <UInput
          v-model="password"
          variant="outline"
          color="primary"
          type="password"
          class="w-full"
          placeholder="Create a password (min 8 characters)"
        />

        <UInput
          v-model="confirmPassword"
          variant="outline"
          color="primary"
          type="password"
          class="w-full"
          placeholder="Confirm password"
          @keyup.enter="setPassword"
        />

        <p v-if="passwordError" class="text-brand-red text-sm">
          {{ passwordError }}
        </p>

        <UButton
          variant="outline"
          label="Set Password"
          class="w-full"
          :loading="isLoading"
          @click="setPassword"
        />

        <p v-if="successMessage" class="text-sm mt-2">
          {{ successMessage }}
        </p>
      </div>
    </div>

    <div v-else>
      <h1>Authentication successful!</h1>
      <p>Redirecting you to the dungeon...</p>
    </div>
  </section>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const email = ref("");
const password = ref("");
const emailError = ref("");
const passwordError = ref("");
const successMessage = ref("");
const showPassword = ref(true);
const isLoading = ref(false);
const redirecting = ref(false);

const validateEmail = (email: string) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

const emailValid = computed(() => validateEmail(email.value));

// Sign in with email and password
const signInWithPassword = async () => {
  if (!emailValid.value) {
    emailError.value = "Please enter a valid email address.";
    return;
  }

  if (!password.value) {
    passwordError.value = "Please enter your password.";
    return;
  }

  isLoading.value = true;
  emailError.value = "";
  passwordError.value = "";

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      console.error(error);
      passwordError.value = "Invalid login credentials. Please try again.";
    } else {
      successMessage.value = "Success! You're being redirected...";
      redirecting.value = true;
      setTimeout(() => {
        navigateTo("/");
      }, 1500);
    }
  } finally {
    isLoading.value = false;
  }
};

// Sign up or sign in with OTP (magic link)
const signInWithOtp = async () => {
  if (!emailValid.value) {
    emailError.value = "Please enter a valid email address.";
    return;
  }

  isLoading.value = true;
  emailError.value = "";

  const currentOrigin = window.location.origin;
  const redirectTo = `${currentOrigin}/confirm`;

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      console.error(error);
      emailError.value = "An error occurred. Please try again.";
    } else {
      successMessage.value =
        "Success! Check your email (including that godforsaken spam folder, if you don't see it in your inbox), and click the link to enter the dungeon.";
      email.value = "";
    }
  } finally {
    isLoading.value = false;
  }
};

const togglePasswordMode = () => {
  showPassword.value = !showPassword.value;
};

const pageLoaded = ref(false);
onMounted(() => {
  setTimeout(() => {
    pageLoaded.value = true;
  }, 1000);
});
</script>

<template>
  <section
    class="text-center column-flex relative h-full items-center max-w-[600px] gap-4 justify-center"
  >
    <div>
      <h1>Welcome, wordsmith</h1>
      <p v-if="!showPassword">
        Enter your email below, and we'll magically grant you access to the
        dungeon!
      </p>
      <p v-else>Enter your email and password to continue.</p>
    </div>

    <UInput
      v-model="email"
      variant="outline"
      color="primary"
      type="email"
      class="email-input w-full"
      :class="[emailError && 'border-brand-red', emailValid && 'email-valid']"
      icon="material-symbols:thumb-down-sharp"
      placeholder="Enter your email"
      autocomplete="email"
      @keyup.enter="showPassword ? signInWithPassword() : signInWithOtp()"
    />
    <p v-if="emailError" class="text-brand-red text-sm">{{ emailError }}</p>

    <UInput
      v-if="showPassword"
      v-model="password"
      variant="outline"
      color="primary"
      type="password"
      class="w-full"
      :class="[passwordError && 'border-brand-red']"
      placeholder="Enter your password"
      @keyup.enter="signInWithPassword"
    />
    <p v-if="passwordError" class="text-brand-red text-sm">
      {{ passwordError }}
    </p>

    <UButton
      variant="outline"
      :label="showPassword ? 'Sign In' : 'Send Magic Link'"
      class="w-full"
      :loading="isLoading"
      :disabled="!emailValid || (showPassword && !password.length)"
      @click="showPassword ? signInWithPassword() : signInWithOtp()"
    />

    <UButton
      v-if="!redirecting"
      variant="link"
      :label="
        showPassword
          ? 'First time here? Sign in with magic link instead'
          : 'Sign in with email and password instead'
      "
      @click.prevent="togglePasswordMode"
    />

    <p v-if="successMessage" class="text-sm">
      {{ successMessage }}
    </p>

    <div
      class="fixed w-[50vw] h-full top-0 transition-all ease-in-out duration-[4000ms] bg-[url(/img/door-left.webp)] bg-cover bg-no-repeat bg-right bg-brand-black brightness-50"
      :class="pageLoaded ? '-left-full' : 'left-0'"
    />
    <div
      class="fixed w-[50vw] h-full top-0 transition-all ease-in-out duration-[4000ms] bg-[url(/img/door-right.webp)] bg-cover bg-no-repeat bg-left bg-brand-black brightness-50"
      :class="pageLoaded ? '-right-full' : 'right-0'"
    />
  </section>
</template>

<style scoped>
.email-input :deep(span) {
  transition: all 0.3s ease-in-out;
  padding: 10px;
  opacity: 0.5;
}
.email-valid :deep(span) {
  rotate: 90deg;
  opacity: 1;
}
</style>

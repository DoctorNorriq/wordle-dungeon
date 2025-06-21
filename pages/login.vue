<script setup lang="ts">
const supabase = useSupabaseClient();
const email = ref("");
const emailError = ref("");
const successMessage = ref("");

const validateEmail = (email: string) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

const emailValid = computed(() => validateEmail(email.value));

const signInWithOtp = async () => {
  if (!validateEmail(email.value)) {
    emailError.value = "Please enter a valid email address.";
    return;
  }

  emailError.value = "";

  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: "http://localhost:3000/confirm",
    },
  });

  if (error) {
    console.log(error);
    emailError.value = "An error occurred. Please try again.";
  } else {
    successMessage.value =
      "Succes! Check your email (including that godforsaken spam folder, if you don't see it in your inbox), and click the link to enter the dungeon.";
    email.value = "";
  }
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
      <p>
        Enter and confirm your email below, and we'll magically grant you access
        to the dungeon!
      </p>
    </div>
    <UInput
      v-model="email"
      variant="outline"
      color="primary"
      type="email"
      class="email-input w-full"
      :class="[emailError && 'border-brand-red', emailValid && 'email-valid']"
      icon="material-symbols:thumb-down-sharp"
      @keyup.enter="signInWithOtp"
    />
    <UButton
      variant="outline"
      label="Confirm Email"
      class="w-full"
      @click="signInWithOtp"
    />
    <p v-if="emailError" class="text-brand-red text-sm">{{ emailError }}</p>
    <p v-if="successMessage" class="text-sm mt-2">
      {{ successMessage }}
    </p>
    <div
      class="fixed w-[50vw] h-full top-0 transition-all ease-in-out duration-[4000ms] bg-[url(/img/door-left.webp)] bg-cover bg-no-repeat bg-right bg-brand-black brightness-50"
      :class="pageLoaded ? '-left-full' : 'left-0'"
    ></div>
    <div
      class="fixed w-[50vw] h-full top-0 transition-all ease-in-out duration-[4000ms] bg-[url(/img/door-right.webp)] bg-cover bg-no-repeat bg-left bg-brand-black brightness-50"
      :class="pageLoaded ? '-right-full' : 'right-0'"
    ></div>
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

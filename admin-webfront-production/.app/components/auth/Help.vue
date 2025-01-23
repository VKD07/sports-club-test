<script setup lang="ts">
const isModalHelpOpen = ref(false)
</script>

<template>
  <NuxtLink
    @click="isModalHelpOpen = true"
    class="text-muted-600 hover:text-primary-500 dark:text-muted-200 font-sans font-medium text-xs underline-offset-4 transition duration-150 ease-in-out cursor-pointer"
  >
    Help
  </NuxtLink>

  <!-- Add Category component -->
  <div>
    <TairoModal :open="isModalHelpOpen" size="3xl" @close="isModalHelpOpen = false">
      <template #header>
        <!-- Header -->
        <div class="relative">
          <div class="p-6 pe-16">
            <div class="flex gap-4 lg:items-center justify-between flex-col lg:flex-row">
              <div>
                <BaseHeading
                  tag="h2"
                  size="xl"
                  weight="bold"
                  lead="normal"
                  class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                >
                  Help
                </BaseHeading>
              </div>
            </div>
          </div>

          <BaseButtonClose
            @click="isModalHelpOpen = false"
            class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
          />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-[calc(100vh-16rem)]">
        <div class="prose prose-light">
          <h4>Get Assistance</h4>

          <p>
            If you encounter any difficulties while using our platform, don't worry, we're here to
            help! Below are the contact details for technical support and operational assistance.
          </p>
          <p>
            Reach out to us via email or phone, and our dedicated team will swiftly address your
            concerns.
          </p>

          <h4>Technical Support:</h4>

          <p>
            Email: <a href="mailto:support@estars.pro">support@estars.pro</a>
            <br />
            Phone: <a href="tel:+44 7830 121263">+44 7830 121263</a>
          </p>

          <p>Don't hesitate to get in touch with us.</p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalHelpOpen = false"> Cancel </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>

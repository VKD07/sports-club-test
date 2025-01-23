<template>
  <div class="mx-auto w-full h-screen overflow-hidden">
    <!--Media image-->

    <div class="h-full w-full">
      <img class="w-full h-full object-cover mx-auto" src="/img/login/background.png" alt="" />

      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-4/6 backdrop-blur-sm bg-white/25 shadow-md ring-1 ring-white/50 rounded-xl flex items-end"
      >
        <img class="w-10/12 mx-auto" src="/img/login/Laptop.png" alt="login-banner" />

        <img class="w-20 -translate-y-1/2 absolute top-0 left-8" src="/img/login/Icon 01.png" />

        <img class="w-20 translate-x-1/2 absolute top-16 right-0" src="/img/login/Icon 02.png" />

        <img class="w-20 -translate-x-1/2 absolute top-48 left-0" src="/img/login/Icon 03.png" />

        <img class="w-20 translate-y-1/2 absolute bottom-0 right-12" src="/img/login/Icon 04.png" />
      </div>
    </div>

    <div class="absolute bottom-6 w-full px-8 flex gap-2 justify-between items-end">
      <div class="flex gap-4 items-center">
        <p class="text-muted-100 text-xs">Version 1.0</p>
      </div>

      <div>
        <p class="text-muted-100 text-xs">©2024 All Rights Reserved.</p>
      </div>
    </div>
  </div>
</template>

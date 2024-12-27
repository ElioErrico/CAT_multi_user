<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const username = ref('')
const password = ref('')

const { can } = usePerms()

const showSettings = computed(
  () =>
    can('READ', 'LLM') ||
    can('READ', 'USERS') ||
    can('READ', 'EMBEDDER') ||
    can('READ', 'STATUS') ||
    can('LIST', 'LLM') ||
    can('LIST', 'USERS') ||
    can('LIST', 'EMBEDDER') ||
    can('LIST', 'STATUS'),
)

function handleSave() {
  // 1. Salva i valori in localStorage (o dove preferisci)
  localStorage.setItem('username', username.value)
  localStorage.setItem('password', password.value)

  // 2. Costruisci la query string e fai un redirect
  const queryString = `?username=${username.value}&password=${password.value}`
  // Supponiamo che il tuo dev server stia girando sulla porta 3000
  window.location.href = `http://localhost:3000/${queryString}`
}

// Quando il componente viene montato, verifichiamo se ci sono già
// username e password salvati nel localStorage
onMounted(() => {
  const savedUsername = localStorage.getItem('username')
  const savedPassword = localStorage.getItem('password')
  if (savedUsername) username.value = savedUsername
  if (savedPassword) password.value = savedPassword
})
</script>

<template>
  <div class="navbar sticky top-0 z-30 min-h-fit bg-base-100 font-medium shadow-md md:px-[5%] lg:px-[10%]">
    <!-- NAVBAR START -->
    <div class="navbar-start flex items-center gap-4">
      <!-- Form di autenticazione con ID e v-model -->
      <div class="flex flex-wrap items-center gap-2">
        <input
          id="username-input"
          type="text"
          placeholder="Username"
          class="input input-bordered input-sm w-full md:w-auto max-w-xs"
          v-model="username"
        />
        <input
          id="password-input"
          type="password"
          placeholder="Password"
          class="input input-bordered input-sm w-full md:w-auto max-w-xs"
          v-model="password"
        />
        <button
          id="save-button"
          class="btn btn-primary btn-sm w-full md:w-auto"
          @click="handleSave"
        >
          Save
        </button>
      </div>


      <!-- Menu hamburger (resto del codice esistente) -->
      <Menu v-slot="{ open }" as="div" class="relative inline-block rounded-md md:hidden">
        <MenuButton class="btn btn-circle btn-ghost" title="Menu">
          <heroicons-x-mark-20-solid v-if="open" class="swap-on size-6" />
          <heroicons-bars-3-solid v-else class="swap-off size-6" />
        </MenuButton>
        <Transition
          enterActiveClass="transition duration-200 ease-out"
          enterFromClass="transform scale-90 opacity-0"
          enterToClass="transform scale-100 opacity-100"
          leaveActiveClass="transition duration-200 ease-in"
          leaveFromClass="transform scale-100 opacity-100"
          leaveToClass="transform scale-90 opacity-0"
        >
          <MenuItems
            as="ul"
            class="menu menu-md absolute left-0 z-50 mt-4 w-min origin-top-left gap-2 whitespace-nowrap rounded-md bg-base-100 shadow-xl"
          >
            <MenuItem v-if="can('READ', 'CONVERSATION') || can('LIST', 'CONVERSATION')" as="li">
              <RouterLink to="/">
                <heroicons-home-20-solid class="size-4" /> Home
              </RouterLink>
            </MenuItem>
            <MenuItem v-if="can('READ', 'MEMORY') || can('LIST', 'MEMORY')" as="li">
              <RouterLink :key="$route.fullPath" :to="{ path: '/memory' }">
                <ph-brain-fill class="size-4" /> Memory
              </RouterLink>
            </MenuItem>
            <MenuItem v-if="can('READ', 'PLUGINS') || can('LIST', 'PLUGINS')" as="li">
              <RouterLink :key="$route.fullPath" :to="{ path: '/plugins' }">
                <ph-plug-fill class="size-4" /> Plugins
              </RouterLink>
            </MenuItem>
            <MenuItem v-if="showSettings" as="li">
              <RouterLink
                :key="$route.fullPath"
                :to="{ path: '/settings' }"
                :class="{ active: $route.path === '/settings' }"
              >
                <heroicons-cog-6-tooth-20-solid class="size-4" /> Settings
              </RouterLink>
            </MenuItem>
            <MenuItem as="li">
              <a href="https://cheshire-cat-ai.github.io/docs/" target="_blank">
                <heroicons-document-text-solid class="size-4" /> Docs
              </a>
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
    <!-- NAVBAR CENTER -->
    <div class="navbar-center">
      <RouterLink to="/" class="shrink-0 !bg-transparent md:hidden">
        <!-- <img
          src="@assets/logo.svg"
          class="size-12 cursor-pointer dark:brightness-0 dark:invert"
        /> -->
      </RouterLink>
      <ul class="menu menu-horizontal menu-md hidden gap-4 p-0 md:flex">
        <li v-if="can('READ', 'CONVERSATION') || can('LIST', 'CONVERSATION')">
          <RouterLink to="/">
            <heroicons-home-20-solid class="size-4" /> Home
          </RouterLink>
        </li>
        <li v-if="can('READ', 'MEMORY') || can('LIST', 'MEMORY')">
          <RouterLink :key="$route.fullPath" :to="{ path: '/memory' }">
            <ph-brain-fill class="size-4" /> Memory
          </RouterLink>
        </li>
        <li v-if="can('READ', 'PLUGINS') || can('LIST', 'PLUGINS')">
          <RouterLink :key="$route.fullPath" :to="{ path: '/plugins' }">
            <ph-plug-fill class="size-4" /> Plugins
          </RouterLink>
        </li>
        <li v-if="showSettings">
          <RouterLink
            :key="$route.fullPath"
            :to="{ path: '/settings' }"
            :class="{ active: $route.path === '/settings' }"
          >
            <heroicons-cog-6-tooth-20-solid class="size-4" /> Settings
          </RouterLink>
        </li>
        <li>
          <a href="https://cheshire-cat-ai.github.io/docs/" target="_blank">
            <heroicons-document-text-solid class="size-4" /> Docs
          </a>
        </li>
      </ul>
    </div>
    <!-- NAVBAR END -->
    <div class="navbar-end">
      <ThemeButton />
    </div>
  </div>
</template>

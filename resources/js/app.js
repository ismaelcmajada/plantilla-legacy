import "./bootstrap"

// Vue + Inertia
import { createApp, h } from "vue"
import { createInertiaApp } from "@inertiajs/vue3"

// Toast
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"

// Vuetify 3
import "vuetify/styles"
import { createVuetify } from "vuetify"
import { es } from "vuetify/locale"
import "@mdi/font/css/materialdesignicons.css"
import { aliases, mdi } from "vuetify/iconsets/mdi"

// Plugins tuyos
import link from "@/Plugins/link"

// Layouts
import AppLayout from "@/Layouts/App.vue"
import DashboardLayout from "@/Layouts/Dashboard.vue"

// App name
const appName =
  window.document.getElementsByTagName("title")[0]?.innerText || "Dashboard"

// Vuetify config
const vuetify = createVuetify({
  theme: {
    defaultTheme: "customLight",
    themes: {
      customLight: {
        dark: false,
        colors: {
          background: "#F3F4F6",
        },
      },
      customDark: {
        dark: true,
      },
      appTheme: {
        dark: true,
        colors: {
          surface: "#161d31",
          primary: "#3f51b5",
          error: "#f44336",
        },
      },
    },
  },

  locale: {
    locale: "es",
    messages: { es },
  },

  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
})

/**
 * Resolver de páginas Inertia (Webpack)
 */
const pages = require.context("./Pages", true, /\.vue$/)

function resolvePage(name) {
  const path = `./${name}.vue`

  if (!pages.keys().includes(path)) {
    throw new Error(`Inertia page not found: ${path}`)
  }

  return pages(path).default
}

createInertiaApp({
  title: (title) => `${title} - ${appName}`,

  resolve: (name) => {
    const page = resolvePage(name)

    page.layout = name.startsWith("Dashboard/") ? DashboardLayout : AppLayout

    return page
  },

  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .use(Toast)
      .use(vuetify)
      .use(link)
      .mount(el)
  },

  progress: {
    color: "#4B5563",
  },
})

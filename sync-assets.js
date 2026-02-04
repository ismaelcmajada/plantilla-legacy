#!/usr/bin/env node

/**
 * Script para sincronizar assets desde public/ a la raíz
 * Para desarrollo con estructura FTP
 */

const fs = require("fs")
const path = require("path")

// Leer variable ASSET_BASE_PATH desde .env
function getAssetBasePath() {
  const envPath = path.join(__dirname, ".env")
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8")
    const match = envContent.match(/^ASSET_BASE_PATH=(.*)$/m)
    if (match) {
      // Limpiar comillas si las tiene
      return match[1].replace(/^["']|["']$/g, "").trim()
    }
  }
  return "" // Sin prefijo por defecto
}

const ASSET_BASE_PATH = getAssetBasePath()

// Función para copiar archivos recursivamente
function copyRecursive(src, dest) {
  const stats = fs.statSync(src)

  if (stats.isDirectory()) {
    // Crear directorio si no existe
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }

    // Copiar contenido del directorio
    const files = fs.readdirSync(src)
    files.forEach((file) => {
      copyRecursive(path.join(src, file), path.join(dest, file))
    })
  } else {
    // Copiar archivo
    fs.copyFileSync(src, dest)
  }
}

// Función para arreglar mix-manifest en producción
function fixMixManifest() {
  const manifestPath = "public/mix-manifest.json"
  const isProd =
    process.argv.includes("--prod") || process.env.NODE_ENV === "production"

  if (isProd && fs.existsSync(manifestPath)) {
    console.log(
      `🔧 Corrigiendo mix-manifest.json para subdirectorio ${ASSET_BASE_PATH || "(raíz)"}...`,
    )

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    const fixedManifest = {}

    // Agregar prefijo /transparencia a todos los paths
    for (const [key, value] of Object.entries(manifest)) {
      fixedManifest[key] = `${ASSET_BASE_PATH}${value}`
    }

    // Escribir el manifest corregido
    fs.writeFileSync(manifestPath, JSON.stringify(fixedManifest, null, 4))

    console.log("✅ mix-manifest.json corregido para producción")
  }
}

// Función para sincronizar assets
function syncAssets() {
  console.log("🔄 Sincronizando assets para estructura FTP...")

  try {
    // Primero arreglar mix-manifest si es producción
    fixMixManifest()

    // Directorios y archivos a sincronizar (SIN mix-manifest.json)
    const items = [
      { src: "public/css", dest: "css" },
      { src: "public/js", dest: "js" },
      { src: "public/favicon.ico", dest: "favicon.ico" },
      { src: "public/robots.txt", dest: "robots.txt" },
    ]

    items.forEach((item) => {
      if (fs.existsSync(item.src)) {
        console.log(`  📁 ${item.src} → ${item.dest}`)
        copyRecursive(item.src, item.dest)
      } else {
        console.log(`  ⚠️  ${item.src} no existe, saltando...`)
      }
    })

    console.log("✅ Sincronización completada!")
  } catch (error) {
    console.error("❌ Error durante la sincronización:", error.message)
    process.exit(1)
  }
}

// Ejecutar sincronización
syncAssets()

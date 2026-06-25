// scripts/build.js
// Baut jede App einzeln - nötig, weil vite-plugin-singlefile
// (inlineDynamicImports: true) nicht mit mehreren Rollup-Inputs verträglich ist.

import { build }          from 'vite'
import { svelte }         from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { resolve, dirname } from 'path'
import { fileURLToPath }    from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')

// ── Alle Apps hier eintragen ──────────────────────────────────────────────────
const ENTRIES = [
  {chapter: 'chapter04', name: 'chap04_sec01_quiz'},
  // { chapter: 'chapter11', name: 'chap11_sec02_quiz' },
]

// ── Bauen ─────────────────────────────────────────────────────────────────────
let errors = 0

for (const { chapter, name } of ENTRIES) {
  process.stdout.write(`Building ${name} ... `)
  try {
    await build({
      root:     resolve(ROOT, 'src'),
      plugins:  [svelte(), viteSingleFile()],
      logLevel: 'silent',
      build: {
        outDir: resolve(ROOT, 'interactive'),
        emptyOutDir: false,
        rollupOptions: {
          input: resolve(ROOT, `src/${chapter}/${name}.html`),
        },
      },
    })
    console.log(`✓`)
  } catch (e) {
    console.log(`✗`)
    console.error(e.message)
    errors++
  }
}

console.log(errors === 0
  ? `\n✓ Alle ${ENTRIES.length} Apps gebaut.`
  : `\n✗ ${errors} Fehler.`)

if (errors) process.exit(1)

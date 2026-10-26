// Lab integrity test: `npm run check` (after `npm run games`).
//
// 1. Builds the site into a temp dir and asserts the result, rather than
//    trusting jekyll's exit code: every local href/src resolves to a built
//    file, no Liquid errors leaked into pages, the game bundle exports mount.
// 2. Proves the build fails loudly on broken references (snippet, ram,
//    RAM map) by building a temp copy of the lab with one fault injected.
//
// No dependencies beyond node and jekyll.

import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, symlinkSync, mkdtempSync, readdirSync, readFileSync, appendFileSync, writeFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const LAB = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
let passes = 0

function check(name, ok, detail = '') {
  if (ok) {
    passes++
    console.log(`  ok   ${name}`)
  } else {
    failures.push(name)
    console.log(`  FAIL ${name}${detail ? `\n       ${detail}` : ''}`)
  }
}

function jekyll(source, dest) {
  try {
    execFileSync('jekyll', ['build', '--source', source, '--destination', dest], { stdio: 'pipe' })
    return { ok: true, out: '' }
  } catch (e) {
    return { ok: false, out: `${e.stdout}${e.stderr}` }
  }
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const tmp = mkdtempSync(join(tmpdir(), 'nes-lab-'))

try {
  // ---- 1. The real site ----
  console.log('site')
  const site = join(tmp, 'site')
  const built = jekyll(LAB, site)
  check('jekyll build succeeds', built.ok, built.out.trim().split('\n').pop())

  if (built.ok) {
    const pages = walk(site).filter((f) => f.endsWith('.html'))
    check('home, game, and episode pages exist', [
      'index.html',
      'baseball-stars/index.html',
      'baseball-stars/00-the-lab/index.html',
    ].every((p) => existsSync(join(site, p))))

    for (const page of pages) {
      const html = readFileSync(page, 'utf8')
      const rel = page.slice(site.length)
      check(`${rel}: no Liquid errors`, !/Liquid (syntax )?error/i.test(html))

      const refs = [...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map((m) => m[1])
      const imports = [...html.matchAll(/from '(\/[^']+)'/g)].map((m) => m[1])
      const missing = [...refs, ...imports].filter((url) => {
        const target = join(site, url)
        return !(existsSync(target) && (statSync(target).isFile() || existsSync(join(target, 'index.html'))))
      })
      check(`${rel}: all local links resolve`, missing.length === 0, `missing: ${missing.join(', ')}`)
    }

    check('no ROM-derived workbench in the normal build', !existsSync(join(site, 'workbench')))
    const romish = walk(site).map((f) => f.slice(site.length)).filter((f) => /\.(nes|fds|unf|zip|7z)$/i.test(f) || f.includes('/tmp/'))
    check('no ROMs or archives anywhere in the build', romish.length === 0, romish.slice(0, 3).join(', '))
    const css = join(site, 'assets/css/main.css')
    check('Tailwind compiled main.css', existsSync(css) && statSync(css).size > 5000, existsSync(css) ? `${statSync(css).size} bytes` : 'missing')
    if (existsSync(css)) {
      const text = readFileSync(css, 'utf8')
      check('main.css has the lab theme and the classes the pages use', ['--color-accent', '.badge', '.font-pixel', '.prose', '.pixelated'].every((t) => text.includes(t)))
    }
    check('Tailwind source is not published', !existsSync(join(site, 'assets/css/tailwind.css')))
    check('lightbox script is published', existsSync(join(site, 'assets/js/lightbox.js')))
    check('model source is quoted, not published', !existsSync(join(site, 'models')))
  }

  // ---- 2. Broken references must fail the build ----
  console.log('fail-loud')
  const faults = [
    ['snippet of a missing file', 'episode', '{% snippet lab:models/nope.js lines:1 %}', /not found/],
    ['snippet match with no hit', 'episode', '{% snippet lab:models/baseball-stars/pitch.js match:NO_SUCH_TEXT %}', /not found/],
    ['snippet lines out of range', 'episode', '{% snippet lab:models/baseball-stars/pitch.js lines:9000-9001 %}', /out of range/],
    ['snippet from an unknown repo', 'episode', '{% snippet nope:src/game.js lines:1 %}', /unknown repo/],
    ['ram ref to an unmapped name', 'episode', '{% ram baseball-stars no_such_var %}', /not in _data\/ram/],
    ['episode in an unknown scene', 'episode-scene', 'scene: no-such-scene', /not in _data\/storyboard/],
    ['published screenshot with no record', 'screen-orphan', '', /has no record/],
    ['screenshot include with no record', 'episode', '{% include screenshot.html game="baseball-stars" name="nope" caption="x" %}', /screenshot record not found/],
    ['a ROM left in the site source', 'rom-leak', '', /no ROMs or archives/],
    ['RAM map entry with a bad addr', 'ram', '- { addr: "0x412", name: x, desc: d, confidence: guess }', /addr must look like/],
    ['RAM map entry with a bad confidence', 'ram', '- { addr: "$0412", name: x, desc: d, confidence: sure }', /confidence must be/],
  ]

  for (const [name, where, text, expect] of faults) {
    const copy = join(tmp, 'fault')
    rmSync(copy, { recursive: true, force: true })
    cpSync(LAB, copy, { recursive: true, filter: (src) => !/\/(_site|\.jekyll-cache|workbench|\.git|node_modules|tmp)(\/|$)/.test(src) })
    symlinkSync(join(LAB, 'node_modules'), join(copy, 'node_modules'))
    // The copy lives elsewhere, so point relative code_roots back at the real repos.
    const config = join(copy, '_config.yml')
    writeFileSync(config, readFileSync(config, 'utf8').replace(/^(  [\w-]+: )(\.{1,2}(?:\/[^\s]*)?)$/gm, (_, key, rel) => `${key}${resolve(LAB, rel)}`))
    const episode = join(copy, '_episodes/baseball-stars/01-the-pitch.md')
    const board = join(copy, '_data/storyboard/baseball-stars.yml')
    if (where === 'episode') appendFileSync(episode, `\n${text}\n`)
    else if (where === 'episode-scene') writeFileSync(episode, readFileSync(episode, 'utf8').replace(/^scene: .*$/m, text))
    else if (where === 'storyboard') {
      const [from, to] = text.split('|')
      writeFileSync(board, readFileSync(board, 'utf8').replace(from, to))
    } else if (where === 'rom-leak') {
      writeFileSync(join(copy, 'assets/disk.FDS'), Buffer.from('FDS\x1a'))
    } else if (where === 'screen-orphan') {
      mkdirSync(join(copy, 'assets/screens/baseball-stars'), { recursive: true })
      writeFileSync(join(copy, 'assets/screens/baseball-stars/orphan.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]))
    } else writeFileSync(join(copy, '_data/ram/baseball-stars.yml'), `${text}\n`)

    const result = jekyll(copy, join(tmp, 'fault-out'))
    check(`${name} fails the build`, !result.ok && expect.test(result.out), result.ok ? 'build succeeded' : result.out.trim().split('\n').pop())
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

console.log(`\n${passes} passed, ${failures.length} failed`)
process.exit(failures.length ? 1 : 0)

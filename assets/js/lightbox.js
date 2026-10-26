// Lightbox for screenshots and tiles.
//
// Markup stays a plain link, so it works without JS:
//   <a href="full.png" data-lightbox="group-name" data-caption="attract · t053 · frame 3180">
//     <img src="full.png" ...>
//   </a>
// With JS, clicking opens a <dialog> with the image as large as fits, pixel-sharp.
// ← / → step through the same group (a run, a part of the storyboard); Esc or a
// click outside the image closes it.

const dialog = document.createElement('dialog')
dialog.className = 'lightbox'
dialog.setAttribute('aria-label', 'Image viewer')
dialog.innerHTML = `
  <figure class="flex flex-col items-center gap-3">
    <img
      class="pixelated block bg-black object-contain"
      alt=""
    >
    <figcaption class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-sm text-white/80">
      <button
        type="button"
        data-step="-1"
        class="rounded border border-white/30 px-2 py-0.5 hover:bg-white/10"
        aria-label="Previous image"
      >←</button>
      <span data-caption></span>
      <span
        data-count
        class="text-white/50"
      ></span>
      <a
        data-original
        class="text-white/80 underline"
        target="_blank"
        rel="noopener"
      >open original</a>
      <button
        type="button"
        data-step="1"
        class="rounded border border-white/30 px-2 py-0.5 hover:bg-white/10"
        aria-label="Next image"
      >→</button>
    </figcaption>
  </figure>`
document.body.append(dialog)

const img = dialog.querySelector('img')
const caption = dialog.querySelector('[data-caption]')
const count = dialog.querySelector('[data-count]')
const original = dialog.querySelector('[data-original]')
let group = []
let index = 0

// Largest whole-number scale that fits, so NES pixels stay square and even.
function fit() {
  const w = img.naturalWidth || 256
  const h = img.naturalHeight || 240
  const scale = Math.max(1, Math.floor(Math.min((innerWidth * 0.92) / w, (innerHeight * 0.82) / h)))
  img.style.width = `${w * scale}px`
  img.style.height = `${h * scale}px`
}

function show(i) {
  index = (i + group.length) % group.length
  const link = group[index]
  img.src = link.href
  img.alt = link.querySelector('img')?.alt || ''
  caption.textContent = link.dataset.caption || img.alt
  count.textContent = group.length > 1 ? `${index + 1} / ${group.length}` : ''
  original.href = link.href
  for (const b of dialog.querySelectorAll('[data-step]')) b.hidden = group.length < 2
}

img.addEventListener('load', fit)
addEventListener('resize', () => dialog.open && fit())

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-lightbox]')
  if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  group = [...document.querySelectorAll(`a[data-lightbox="${CSS.escape(link.dataset.lightbox)}"]`)]
  show(group.indexOf(link))
  dialog.showModal()
})

dialog.addEventListener('click', (e) => {
  const step = e.target.closest('[data-step]')
  if (step) return show(index + Number(step.dataset.step))
  if (e.target === dialog) dialog.close()
})

dialog.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') show(index + 1)
  if (e.key === 'ArrowLeft') show(index - 1)
})

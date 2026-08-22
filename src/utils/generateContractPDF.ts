/**
 * generateContractPDF.ts
 * Uses html2canvas + jsPDF to capture the TenancyContractTemplate DOM
 * and produce a pixel-perfect A4 PDF download — same as reference image.
 */

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Captures every page div inside containerEl and stitches them into one PDF.
 * @param containerEl  The hidden wrapper div containing all page divs
 * @param filename     Output filename (default: GoFreeHold_Contract.pdf)
 */
export async function generateContractPDF(
  containerEl: HTMLDivElement,
  filename = 'GoFreeHold_Contract.pdf'
): Promise<void> {
  const A4_W = 210
  const A4_H = 297

  // Wait for Amiri Arabic font to fully load
  try {
    await document.fonts.load('700 16px Amiri')
    await document.fonts.ready
  } catch (_) { /* font may already be cached */ }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const pages = containerEl.querySelectorAll<HTMLDivElement>('[id^="contract-page-"]')
  if (pages.length === 0) throw new Error('No contract pages found.')

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i]
    const canvas = await html2canvas(pageEl, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
      windowHeight: 1123,
      onclone: (doc) => {
        // Force visibility in cloned doc
        const el = doc.getElementById(pageEl.id)
        if (el) { el.style.display = 'block'; el.style.visibility = 'visible' }
      },
    })
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    if (i > 0) pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_W, A4_H)
  }

  pdf.save(filename)
}

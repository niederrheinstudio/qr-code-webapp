/**
 * Erstellt QR-Codes.
 * @version 25.11.9
 * @copyright 2015-2025 Niederrhein Studio <niederrhein.studio>
 * @author Sascha Schneider <sc@niederrhein.studio>
 * @license AGPL 3.0 (siehe LICENSE für Details)
 * @requires qrcode.js (https://davidshimjs.github.io/qrcodejs/)
 */

/**
 * Kleiner UI-Helfer für Fehlermeldungen / Hinweise
 * @param {*} msg 
 * @param {*} timeout 
 */
function showMessage (msg, timeout = 3000) {
  let el = document.querySelector('#qr-message')
  if (!el) {
    el = document.createElement('div')
    el.id = 'qr-message'
    el.style.cssText = 'position:fixed;bottom:16px;right:16px;' + 
      'background:rgba(255, 0, 0, 0.8);color:#fff;padding:8px 12px;' + 
      'border-radius:6px;font-family:sans-serif;z-index:9999;max-width:320px;'
    document.body.appendChild(el)
  }
  el.textContent = msg
  if (timeout > 0) {
    clearTimeout(el._timer)
    el._timer = setTimeout(() => { el.remove() }, timeout)
  }
}

/**
 * Generiert einen QR-Code basierend auf den Eingaben des Benutzers.
 */
function generateQRCode () { 
    const qrcode = document.querySelector('#qrcode')
    const textEl = document.querySelector('#qrtext')
    const sizeEl = document.querySelector('#qrsize')
    const levelEl = document.querySelector('#qrlevel')

    // Prüfe gezielt, welche Elemente fehlen, und zeige UI-Feedback
    const missing = []
    if (!qrcode) missing.push('qrcode')
    if (!textEl) missing.push('qrtext')
    if (!sizeEl) missing.push('qrsize')
    if (!levelEl) missing.push('qrlevel')
    if (missing.length) {
      showMessage('Fehlende Elemente: ' + missing.join(', '), 5000)
      return
    }

    const text = textEl.value
    const size = parseInt(sizeEl.value, 10) || 128
    const border = 16
    const level = levelEl.value
    let quality = QRCode.CorrectLevel.H
    if(level==="L") quality = QRCode.CorrectLevel.L
    if(level==="M") quality = QRCode.CorrectLevel.M
    if(level==="Q") quality = QRCode.CorrectLevel.Q
    qrcode.setAttribute("style","height:" + (size + (border*2)) + "px;width:" + 
      (size + (border*2)) + "px")
    qrcode.innerText = ""
    new QRCode(qrcode, {
      text: text.length>0?text:" ",
      width: size,
      height: size,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: quality
    })

    // Von der QRCode.js-Bibliothek wird standardmäßig ein title-Attribut
    // gesetzt, welches den QR-Code beschreibt. Da dieses leer ist, wenn kein
    // Text eingegeben wurde, entfernen wir es hier, um Barrierefreiheits-
    // Tests zu bestehen.
    document.getElementById('qrcode').removeAttribute('title') 
}

/**
 * Lädt den generierten QR-Code als PNG-Datei herunter.
 */
function downloadQRCode () { 
    const canvas = document.querySelector('#qrcode canvas')
    if (!canvas) { 
      showMessage('Kein QR-Code vorhanden zum Download', 2500) 
      return 
    }

    // bevorzugt: Blob (speicherfreundlichere Methode)
    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        if (!blob) { 
          showMessage('Fehler beim Erstellen des Bildes', 2500)
          return 
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'qr-code.png'
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1500)
      }, 'image/png')
      return
    }

    // Fallback: dataURL (ältere Browser / seltene Umgebungen)
    try {
      const dataURL = canvas.toDataURL('image/png')
      // iOS Safari: download-Attribut wird oft ignoriert -> öffne in neuem Tab
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        window.open(dataURL, '_blank')
        return
      }
      const a = document.createElement('a')
      a.href = dataURL
      a.download = 'qr-code.png'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      showMessage('Download nicht möglich: ' + 
        (err && err.message ? err.message : ''), 3000)
    }
}

/**
 * Event-Listener für die Eingabefelder und Buttons.
 */
// sichere Registrierung der Event-Listener (nur wenn Elemente vorhanden)
const _qrtext = document.querySelector('#qrtext')
if (_qrtext) _qrtext.addEventListener('input', generateQRCode)
const _qrlevel = document.querySelector('#qrlevel')
if (_qrlevel) _qrlevel.addEventListener('click', generateQRCode)
const _qrsize = document.querySelector('#qrsize')
if (_qrsize) _qrsize.addEventListener('click', generateQRCode)
const _qrdownload = document.querySelector('#qrdownload')
if (_qrdownload) _qrdownload.addEventListener('click', downloadQRCode)
const _buttonabout = document.querySelector('#button-about')
if (_buttonabout) _buttonabout.addEventListener('click', function () {
  $('#modal-about').modal('show')
})

/**
 * Initiale Generierung des QR-Codes beim Laden der Seite.
 */
generateQRCode()

// EOF
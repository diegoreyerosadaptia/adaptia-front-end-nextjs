export function pdfBytesToBase64(pdfBytes: Uint8Array) {
    let binary = ""
    const len = pdfBytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(pdfBytes[i])
    }
    return btoa(binary) // base64
  }
  
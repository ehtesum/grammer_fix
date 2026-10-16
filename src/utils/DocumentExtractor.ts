import mammoth from 'mammoth';

export function cleanPdfLineBreaks(rawText: string): string {
  return rawText
    // Merge hyphenated words across line breaks or spaces: "func- tional" -> "functional", "rea- soning" -> "reasoning"
    .replace(/(\b[a-zA-Z]{2,})-\s+([a-zA-Z]{2,}\b)/g, '$1$2')
    // Merge split single-letter prefixes: "M ulti-" -> "Multi-", "A gent" -> "Agent", "C ollaboration" -> "Collaboration"
    .replace(/\b([A-Z])\s+([a-z]{2,})\b/g, '$1$2')
    // Fix comma spacing: "MACT ," -> "MACT,"
    .replace(/\b(\w+)\s+,\b/g, '$1,');
}

export async function extractHtmlFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // 1. Word Documents (.docx / .doc) -> Full HTML layout conversion via Mammoth
  if (['docx', 'doc'].includes(extension)) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (result.value && result.value.trim().length > 0) {
        return cleanPdfLineBreaks(result.value.trim());
      }
    } catch (e) {
      // Fallback
    }
  }

  // 2. PDF Documents (.pdf) -> Layout-aware Y-coordinate paragraph & heading reconstruction
  if (extension === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import('pdfjs-dist');

      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      }

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let htmlParagraphs: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let currentParagraph = '';
        let lastY: number | null = null;
        let lastFontSize = 0;

        for (const item of textContent.items as any[]) {
          if (!item.str || item.str.trim() === '') continue;

          const y = item.transform ? item.transform[5] : null;
          const fontSize = item.transform ? Math.abs(item.transform[0]) : 12;

          // Check for line break / new paragraph based on Y position shift
          if (lastY !== null && y !== null && Math.abs(lastY - y) > fontSize * 1.2) {
            if (currentParagraph.trim()) {
              const cleaned = cleanPdfLineBreaks(currentParagraph.trim());
              if (lastFontSize > 15) {
                htmlParagraphs.push(`<h1>${cleaned}</h1>`);
              } else if (lastFontSize > 13) {
                htmlParagraphs.push(`<h2>${cleaned}</h2>`);
              } else {
                htmlParagraphs.push(`<p>${cleaned}</p>`);
              }
            }
            currentParagraph = '';
          }

          // Handle line-break hyphenation at string end
          if (currentParagraph.endsWith('-')) {
            currentParagraph = currentParagraph.slice(0, -1) + item.str;
          } else {
            currentParagraph += (currentParagraph ? ' ' : '') + item.str;
          }

          lastY = y;
          lastFontSize = fontSize;
        }

        if (currentParagraph.trim()) {
          const cleaned = cleanPdfLineBreaks(currentParagraph.trim());
          if (lastFontSize > 15) {
            htmlParagraphs.push(`<h1>${cleaned}</h1>`);
          } else if (lastFontSize > 13) {
            htmlParagraphs.push(`<h2>${cleaned}</h2>`);
          } else {
            htmlParagraphs.push(`<p>${cleaned}</p>`);
          }
        }
      }

      if (htmlParagraphs.length > 0) {
        return htmlParagraphs.join('');
      }
    } catch (e) {
      // Fallback
    }
  }

  // 3. Markdown / Plain Text / TeX -> Convert Markdown/Text structures to HTML
  const rawText = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.readAsText(file);
  });

  const cleanedRaw = cleanPdfLineBreaks(rawText);
  const blocks = cleanedRaw.split(/\n\s*\n/);

  return blocks
    .map((b) => {
      const trimmed = b.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.replace(/^#\s+/, '')}</h1>`;
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.replace(/^##\s+/, '')}</h2>`;
      if (trimmed.startsWith('### ')) return `<h3>${trimmed.replace(/^###\s+/, '')}</h3>`;
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').map((i) => `<li>${i.replace(/^[-*]\s+/, '')}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
}

export async function extractTextFromFile(file: File): Promise<string> {
  const html = await extractHtmlFromFile(file);
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

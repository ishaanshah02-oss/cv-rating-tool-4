console.log('script.js LOADED');

document.getElementById('fileInput').addEventListener('change', handleFile);
document.getElementById('rateBtn').addEventListener('click', rateCV);

async function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type === 'application/pdf') {
    extractPdfText(file);
  } else {
    file.text().then(text => {
      document.getElementById('cvText').value = text;
    });
  }
}

async function extractPdfText(file) {
  const reader = new FileReader();
  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '
';
    }

    document.getElementById('cvText').value = text.trim();
  };
  reader.readAsArrayBuffer(file);
}

function rateSection(cv, keywords) {
  let score = 0;
  const hay = cv.toLowerCase();
  keywords.forEach(k => {
    if (hay.includes(k.toLowerCase())) score++;
  });
  return Math.min(10, (score / Math.max(1, keywords.length)) * 10);
}

function generateStars(score) {
  const s = Math.round(score);
  return '★'.repeat(s) + '☆'.repeat(5 - s);
}

function rateCV() {
  const cv = document.getElementById('cvText').value;
  if (cv.length < 40) {
    alert('Please paste more CV text or upload a PDF.');
    return;
  }

  const layoutWords = ['education','experience','skills','projects','profile','achievements'];
  const financeWords = ['finance','bank','investment','valuation','analyst','excel','modelling'];
  const experienceWords = ['intern','placement','analyst','project','work'];
  const quantWords = ['%','£','$','increased','reduced','improved','saved','led'];
  const extraWords = ['society','volunteer','committee','sports','club'];

  const scores = {
    layout:      rateSection(cv, layoutWords),
    finance:     rateSection(cv, financeWords),
    experience:  rateSection(cv, experienceWords),
    quant:       rateSection(cv, quantWords),
    extra:       rateSection(cv, extraWords)
  };

  const overall = ((scores.layout + scores.finance + scores.experience + scores.quant + scores.extra) / 50) * 5;

  const results = document.getElementById('results');
  results.innerHTML = `
    <div class="stars">${generateStars(overall)}</div>
    <div class="score"><strong>Overall:</strong> ${overall.toFixed(1)} / 5</div>
    <div class="score"><strong>Layout:</strong> ${scores.layout.toFixed(1)} / 10</div>
    <div class="score"><strong>Fit for Finance:</strong> ${scores.finance.toFixed(1)} / 10</div>
    <div class="score"><strong>Relevant Experience:</strong> ${scores.experience.toFixed(1)} / 10</div>
    <div class="score"><strong>Quantifiable Metrics:</strong> ${scores.quant.toFixed(1)} / 10</div>
    <div class="score"><strong>Extracurriculars:</strong> ${scores.extra.toFixed(1)} / 10</div>
  `;

  results.classList.remove('hidden');
}

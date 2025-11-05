import { calculateWithSalePrice, calculateWithTargetMargin } from './modules/simulator.js';

const form = document.getElementById('simulation-form');
const resultBody = document.querySelector('#results-table tbody');
const errorContainer = document.getElementById('form-error');
const scenarioInputs = form.querySelectorAll("input[name='scenario']");
const scenarioFields = form.querySelectorAll('[data-scenario]');

function updateScenarioFields() {
  const selected = form.querySelector("input[name='scenario']:checked").value;
  scenarioFields.forEach((field) => {
    const shouldShow = field.getAttribute('data-scenario') === selected;
    field.classList.toggle('hidden', !shouldShow);
    const input = field.querySelector('input');
    if (input) {
      input.required = shouldShow;
      if (!shouldShow) {
        input.value = '';
      }
    }
  });
  errorContainer.textContent = '';
  resultBody.innerHTML = '';
}

scenarioInputs.forEach((input) => input.addEventListener('change', updateScenarioFields));

function getLabelText(input) {
  const label = input.closest('label');
  if (!label) return input.id;
  const textNode = Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  return textNode ? textNode.textContent.trim() : label.textContent.trim();
}

function parseField(id) {
  const input = document.getElementById(id);
  const value = input.value.trim();
  const labelText = getLabelText(input);
  if (value === '') {
    throw new Error(`Le champ ${labelText} est obligatoire.`);
  }
  const number = Number(value);
  if (Number.isNaN(number) || number < 0) {
    throw new Error(`La valeur saisie pour ${labelText} doit être positive.`);
  }
  return number;
}

function parseOptionalField(id) {
  const input = document.getElementById(id);
  const value = input.value.trim();
  if (value === '') {
    return 0;
  }
  const number = Number(value);
  const labelText = getLabelText(input);
  if (Number.isNaN(number) || number < 0) {
    throw new Error(`La valeur saisie pour ${labelText} doit être positive.`);
  }
  return number;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2)} %`;
}

function buildRows(result) {
  const rows = [
    ['Prix d\'achat HT', formatCurrency(result.purchasePriceHT)],
    ['Prix de vente HT', formatCurrency(result.salePriceHT)],
    ['Prix de vente TTC', formatCurrency(result.salePriceTTC)],
    ['TVA collectée', `${formatCurrency(result.vatAmount)} (${formatPercent(result.vatRate)})`],
    ['Marge brute', `${formatCurrency(result.grossMargin)} (${formatPercent(result.grossMarginRate)})`],
    ['Bénéfice imposable', formatCurrency(result.taxableProfit)],
    [
      "Impôt sur les sociétés",
      `${formatCurrency(result.corporateTax)} (${formatPercent(result.corporateTaxRate)})`,
    ],
    [
      'Autres contributions',
      `${formatCurrency(result.otherContributions)} (${formatPercent(result.otherContributionsRate)})`,
    ],
    ['Résultat net', formatCurrency(result.netProfit)],
  ];

  if (result.scenario === 'purchaseAndTargetMargin') {
    rows.unshift(['Marge cible', formatPercent(result.targetMarginRate)]);
  }

  return rows;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorContainer.textContent = '';

  try {
    const scenario = form.querySelector("input[name='scenario']:checked").value;
    const purchasePriceHT = parseField('purchasePriceHT');
    const vatRate = parseField('vatRate');
    const corporateTaxRate = parseField('corporateTaxRate');
    const otherContributionsRate = parseOptionalField('otherContributionsRate');

    let result;
    if (scenario === 'purchaseAndSale') {
      const salePriceHT = parseField('salePriceHT');
      result = calculateWithSalePrice({
        purchasePriceHT,
        salePriceHT,
        vatRate,
        corporateTaxRate,
        otherContributionsRate,
      });
    } else {
      const targetMarginRate = parseField('targetMarginRate');
      result = calculateWithTargetMargin({
        purchasePriceHT,
        targetMarginRate,
        vatRate,
        corporateTaxRate,
        otherContributionsRate,
      });
    }

    const rows = buildRows(result);
    resultBody.innerHTML = '';
    rows.forEach(([label, value]) => {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = label;
      const tdValue = document.createElement('td');
      tdValue.textContent = value;
      tr.append(tdLabel, tdValue);
      resultBody.appendChild(tr);
    });
  } catch (error) {
    if (error instanceof Error) {
      errorContainer.textContent = error.message;
    } else {
      errorContainer.textContent = 'Une erreur inattendue est survenue.';
    }
    resultBody.innerHTML = '';
  }
});

updateScenarioFields();

// Pré-remplissage léger pour faciliter les tests rapides dans le navigateur
form.purchasePriceHT.value = '100';
form.salePriceHT.value = '150';
form.targetMarginRate.value = '30';
form.otherContributionsRate.value = '0';
form.vatRate.value = '20';
form.corporateTaxRate.value = '25';

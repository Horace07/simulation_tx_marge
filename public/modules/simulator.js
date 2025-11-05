/**
 * Module de calculs financiers pour la simulation de marges.
 * Toutes les valeurs monétaires sont supposées exprimées hors taxes (HT).
 */

/**
 * Normalise un taux renseigné en pourcentage ou en décimal.
 * @param {number} rate - taux exprimé soit en pourcentage (20) soit en décimal (0.2)
 * @returns {number}
 */
export function normalizeRate(rate) {
  if (typeof rate !== 'number' || Number.isNaN(rate)) {
    throw new Error('Le taux doit être un nombre.');
  }
  if (rate < 0) {
    throw new Error('Le taux ne peut pas être négatif.');
  }
  return rate > 1 ? rate / 100 : rate;
}

/**
 * Calcule les montants détaillés d'un scénario de vente.
 * @param {Object} options
 * @param {number} options.purchasePriceHT - Prix d'achat HT.
 * @param {number} options.salePriceHT - Prix de vente HT.
 * @param {number} options.vatRate - Taux de TVA (décimal ou pourcentage).
 * @param {number} options.corporateTaxRate - Taux d'IS (décimal ou pourcentage).
 * @param {number} [options.otherContributionsRate=0] - Autres contributions en % du bénéfice.
 * @returns {Object}
 */
export function calculateWithSalePrice({
  purchasePriceHT,
  salePriceHT,
  vatRate,
  corporateTaxRate,
  otherContributionsRate = 0,
}) {
  validatePrice(purchasePriceHT, 'purchasePriceHT');
  validatePrice(salePriceHT, 'salePriceHT');

  const vat = normalizeRate(vatRate);
  const corporate = normalizeRate(corporateTaxRate);
  const other = normalizeRate(otherContributionsRate);

  const vatAmount = salePriceHT * vat;
  const salePriceTTC = salePriceHT + vatAmount;
  const grossMargin = salePriceHT - purchasePriceHT;
  const grossMarginRate = salePriceHT === 0 ? 0 : grossMargin / salePriceHT;

  const taxableProfit = Math.max(grossMargin, 0);
  const corporateTax = taxableProfit * corporate;
  const otherContributions = taxableProfit * other;
  const netProfit = taxableProfit - corporateTax - otherContributions;

  return {
    scenario: 'purchaseAndSale',
    purchasePriceHT,
    salePriceHT,
    salePriceTTC,
    vatAmount,
    vatRate: vat,
    grossMargin,
    grossMarginRate,
    taxableProfit,
    corporateTax,
    corporateTaxRate: corporate,
    otherContributions,
    otherContributionsRate: other,
    netProfit,
  };
}

/**
 * Calcule les montants détaillés à partir d'une marge cible.
 * @param {Object} options
 * @param {number} options.purchasePriceHT - Prix d'achat HT.
 * @param {number} options.targetMarginRate - Marge cible (décimal ou pourcentage du prix de vente).
 * @param {number} options.vatRate - Taux de TVA (décimal ou pourcentage).
 * @param {number} options.corporateTaxRate - Taux d'IS (décimal ou pourcentage).
 * @param {number} [options.otherContributionsRate=0] - Autres contributions en % du bénéfice.
 * @returns {Object}
 */
export function calculateWithTargetMargin({
  purchasePriceHT,
  targetMarginRate,
  vatRate,
  corporateTaxRate,
  otherContributionsRate = 0,
}) {
  validatePrice(purchasePriceHT, 'purchasePriceHT');

  const marginRate = normalizeRate(targetMarginRate);
  if (marginRate >= 1) {
    throw new Error('La marge cible doit être inférieure à 100 %.');
  }
  const salePriceHT = purchasePriceHT / (1 - marginRate);
  const base = calculateWithSalePrice({
    purchasePriceHT,
    salePriceHT,
    vatRate,
    corporateTaxRate,
    otherContributionsRate,
  });

  return {
    ...base,
    scenario: 'purchaseAndTargetMargin',
    targetMarginRate: marginRate,
  };
}

function validatePrice(value, fieldName) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new Error(`La valeur ${fieldName} doit être un nombre positif.`);
  }
}

export default {
  normalizeRate,
  calculateWithSalePrice,
  calculateWithTargetMargin,
};

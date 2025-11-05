import { calculateWithSalePrice, calculateWithTargetMargin } from '../public/modules/simulator.js';

const defaultParams = {
  vatRate: 0.2,
  corporateTaxRate: 0.25,
  otherContributionsRate: 0,
};

const scenarios = [
  {
    name: 'Prix d\'achat + prix de vente',
    calculator: () =>
      calculateWithSalePrice({
        purchasePriceHT: 100,
        salePriceHT: 150,
        ...defaultParams,
      }),
  },
  {
    name: "Prix d'achat + marge cible",
    calculator: () =>
      calculateWithTargetMargin({
        purchasePriceHT: 100,
        targetMarginRate: 0.35,
        ...defaultParams,
      }),
  },
];

function formatEuro(value) {
  return `${value.toFixed(2)} €`;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2)} %`;
}

scenarios.forEach(({ name, calculator }) => {
  console.log(`\n=== ${name} ===`);
  const result = calculator();
  const rows = [
    ['Prix d\'achat HT', formatEuro(result.purchasePriceHT)],
    ['Prix de vente HT', formatEuro(result.salePriceHT)],
    ['Prix de vente TTC', formatEuro(result.salePriceTTC)],
    ['TVA collectée', `${formatEuro(result.vatAmount)} (${formatPercent(result.vatRate)})`],
    ['Marge brute', `${formatEuro(result.grossMargin)} (${formatPercent(result.grossMarginRate)})`],
    ['Bénéfice imposable', formatEuro(result.taxableProfit)],
    [
      "Impôt sur les sociétés",
      `${formatEuro(result.corporateTax)} (${formatPercent(result.corporateTaxRate)})`,
    ],
    [
      'Autres contributions',
      `${formatEuro(result.otherContributions)} (${formatPercent(result.otherContributionsRate)})`,
    ],
    ['Résultat net', formatEuro(result.netProfit)],
  ];

  rows.forEach(([label, value]) => {
    console.log(`${label.padEnd(26)} : ${value}`);
  });
});

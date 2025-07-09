/**
 * Fetches the portfolio JSON for a given date.
 * @param {string|null|undefined} date – e.g. "2025-06-13"
 * @returns {Promise<object[]>}
 * @throws if `date` is not provided, the fetch fails, or the response isn’t an array
 */
export async function loadInvestmentPortfolio(date) {
  if (!date) {
    throw new Error('Date is required to load investment portfolio');
  }

  const baseUrl = `/reports-widgets-data/investment-portfolio/investment-portfolio-${date}.json`;
  const jsonUrl = `${baseUrl}?v=${window.BUILD_ID}`;
  const res = await fetch(jsonUrl, { cache: 'reload', headers: { 'Cache-Control': 'no-cache' } });
  if (!res.ok) {
    throw new Error(`Failed to load data (${res.status}) at ${jsonUrl}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Invalid JSON shape at ${jsonUrl}`);
  }

  return data;
}


/**
 * Fetches the profit‐loss JSON for a given date.
 * @param {string|null|undefined} date – e.g. "2025-06-13"
 * @returns {Promise<object[]>}
 * @throws if `date` is not provided, the fetch fails, or the response isn’t an array
 */
export async function loadProfitLoss(date) {
  if (!date) {
    throw new Error('Date is required to load profit/loss data');
  }

  const baseUrl = `/reports-widgets-data/pl-report-summary/pl-report-summary-${date}.json`;
  const jsonUrl = `${baseUrl}?v=${window.BUILD_ID}`;
  const res = await fetch(jsonUrl, { cache: 'reload', headers: { 'Cache-Control': 'no-cache' } });
  if (!res.ok) {
    throw new Error(`Failed to load Profit/Loss data (${res.status}) at ${jsonUrl}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Invalid JSON shape at ${jsonUrl}`);
  }

  return data;
}

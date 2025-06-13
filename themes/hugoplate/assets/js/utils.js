import currency from "currency.js";

export const formatCurrency = (amount, symbol) => {
  return currency(amount, { symbol: symbol ? symbol === 'BASE_SUMMARY' ? "€": symbol : "€", separator: ",", decimal: "." }).format(); // Adjust symbol as needed
};

export const AccountsMap = {
  "Cert of Deposit #1": "Taup. Indėlis #1",
  "Cert of Deposit #3": "Taup. Indėlis #2",
  "Savings, SKU": "Kaup. Indėlis #2",
  "Current Total Net Worth": "Total",
  "III Pillar INVL": "III Pakopa Artea, Ambincingas 16+",
  "III Pillar Luminor Fund": "III Pakopa, LMNR, Tvari Ateitis",
  "Invested Cash": "Akcijos, Indeksai ir kt.",
  "House": "NT, Nuosavas Būstas",
  "Other N.T.": "Kitas NT",
  "Car": "Automobiliai",
  "Total Current Assets": "Grynieji sąskaitose",

  // expenses
  "Bikes": "Vandens Sportas",
  "Travel": "Kelionės",
  "Groceries": "Maistas", 
  "Kindergarten": "Darželiai", 
  "Mortgage Loan": "Būsto Paskola", 
  "Supplies": "Namu apyvoka", 
  "Car Loan": "Lizingas", 
  "Clothes": "Drabužiai", 
  "Dining": "Restoranai", 
  "Fuel": "Kuras", 
  "Childcare": "Vaikų išlaidos", 
  "Medical Expenses": "Medicinos reikmenys", 
};
import { h } from "preact";
import { formatCurrency, AccountsMap } from "../../utils";

export function AssetClasses({ data }) {
  const totalNetWorthObject = data.find(item => item.Account === "Current Total Net Worth");

  const getRoiStyle = (roi) => ({
    color: roi > 0 ? 'green' : roi < 0 ? 'red' : 'black'
  });

  
  return (
    <div>
      <h5 style={headerStyle}>Turto Balansas</h5>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ width: '40%'}}>Turtas</th>
            <th>Įsigijimo Data</th>
            <th>Investuota, €</th>
            <th>Nerealizuota Vertė, €</th>
            <th>ROI</th>
          </tr>
        </thead>
        <tbody>
          {data.map((obj, index) => {
            if (obj.Account !== "Current Total Net Worth") {
              return (
                <tr key={index}>
                  <td>{AccountsMap[obj.Account] || obj.Account}</td>
                  <td>{obj.savingsStart ? obj.savingsStart.split('-')[0] : obj.PurchaseYear || '-'}</td>
                  <td>{formatCurrency(obj.growth?.spentAmountEur || obj.growth?.spentAmount)}</td>
                  <td>{formatCurrency(obj.growth?.currentValueEur || obj.growth?.currentValue)}</td>
                  <td style={getRoiStyle(obj.growth?.roi)}>{obj.growth ? `${obj.growth.roi}%` : '-'}</td>
                </tr>
              );
            }
            return null;
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" style={{textAlign: 'right'}}><strong>Total (-Paskolos)</strong></td>
            <td>{formatCurrency(totalNetWorthObject.growth.currentValueMinusLiabilities)}</td>
            <td style={getRoiStyle(totalNetWorthObject.growth.adjustedRoi)}>{`${totalNetWorthObject.growth.adjustedRoi.toFixed(1)}%`}</td>
          </tr>
        </tfoot>
        <tfoot>
          <tr>
            <td colSpan="2" style={{textAlign: 'right'}}><strong>Total</strong></td>
            <td>{formatCurrency(totalNetWorthObject.growth.spentAmount)}</td>
            <td>{formatCurrency(totalNetWorthObject.growth.currentValue)}</td>
            <td style={getRoiStyle(totalNetWorthObject.growth.roi)}>{`${totalNetWorthObject.growth.roi.toFixed(1)}%`}</td>
          </tr>
        </tfoot>
        <tfoot>
          <tr>
            <td colSpan="3" style={{textAlign: 'right'}}><strong>Paskolos</strong></td>
            <td>{formatCurrency(totalNetWorthObject.Liabilities)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const headerStyle = {
  fontWeight: "normal",
  margin: 0,
  padding: 0,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};
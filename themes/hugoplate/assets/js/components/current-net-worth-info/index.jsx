import { h } from "preact";
import { formatCurrency } from "../../utils";

export function CurrentNetWorth({ data }) {
  return (
    <div>
        <h5 style={headerStyle}>Kapitalo Grąža</h5>
        <div style={containerStyle}>
        <div style={blockStyle}>
              <strong>Nerealizuotas Pelnas: </strong>
            <b style={{...textStyle, color: '#4CAF50' }}>{formatCurrency(data.growth.profitEur)}</b>
        </div>
        <div style={blockStyle}>
            <strong>ROI</strong>
            <b style={{...textStyle, color: '#4CAF50' }}>{data.growth.adjustedRoi} %</b>
        </div>

      </div>   
    </div>
  );
}

const headerStyle = {
  fontWeight: "normal",
  margin: 0,
  padding: 0,
};


const containerStyle = {
    display: 'flex',
    alignItems: 'normal',
    flexDirection: 'column'
};
const blockStyle = {
  display: 'flex', 
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: "2rem"
}

const textStyle = {
  display: 'flex',
  alignSelf: 'center'
}

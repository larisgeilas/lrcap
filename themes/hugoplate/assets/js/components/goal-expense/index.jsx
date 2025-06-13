import { h } from "preact";
import { render } from "preact";
import { ExpenseTimeline } from "../expenses-timeline";
import { GoalNetWorth } from "../goal-net-worth";


export function GoalExpense () {

  return (
    <div style={containerStyle}>
      <style>
        {`
          .responsive-grid-3-2 {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1rem;
          }
          .responsive-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
          .responsive-grid-2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .responsive-grid-1 {
            display: grid;
            grid-template-columns: 3fr;
            gap: 1rem;
          }

          @media (max-width: 900px) {
            .responsive-grid-3 {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 600px) {
            .responsive-grid-3,
            .responsive-grid-3-2,
            .responsive-grid-2 {
              grid-template-columns: 1fr;
            }
        `}
      </style>
      <div className="responsive-grid-2">
        <div>
          <GoalNetWorth />
        </div>
        <div >
          <ExpenseTimeline />
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  padding: "1rem",
};

const gridItemStylePlain = {
  padding: "1rem",
  marginBottom: "1rem"
};

const gridItemStyle = {
  backgroundColor: "white",
  padding: "1rem",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  marginBottom: "1rem"
};

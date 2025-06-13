import React from "react";
import { AccountsMap, formatCurrency } from "../../utils";

const styles = {
    list: {
        listStyle: "none",
        padding: 0,
        margin: 0,
        background: "#fff",
    },
    item: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "2px",
        fontSize: ".75rem",
        margin: 0
    },
    lastItem: {
        borderBottom: "none",
    },
    name: {
        fontWeight: 500,
        color: "#333",
        paddingLeft: '2px'
    },
    amount: {
        fontWeight: 600,
        color: "#1976d2",
    },
    empty: {
        color: "#888",
        padding: "4px",
        textAlign: "center",
    },
};

function TopExpensesList({ expenses }) {

    if (!expenses || expenses.length === 0) {
        return <div style={styles.empty}>No expenses to display.</div>;
    }

    return (
        <ul style={styles.list}>
            {expenses.map((expense, idx) => (
                <li
                    key={AccountsMap[expense.expenseName] || expense.expenseName || idx}
                    style={{
                        ...styles.item,
                        ...(idx === expenses.length - 1 ? styles.lastItem : {}),
                    }}
                >
                    <span style={styles.name}>{AccountsMap[expense.expenseName] || expense.expenseName}</span>
                    <span style={styles.amount}>{formatCurrency(expense.expenseAmount)}</span>
                </li>
            ))}
            <li>
                <span>...</span>
            </li>
        </ul>
    );
}

export default TopExpensesList;

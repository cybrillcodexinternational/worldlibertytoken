"use client";

import styles from "../../tokenomics/tokenomics.module.css";
import { VESTING } from "./data";

export default function VestingTable() {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Vesting Period</th>
            <th>Cliff</th>
          </tr>
        </thead>
        <tbody>
          {VESTING.map((row) => (
            <tr key={row.category}>
              <td className={styles.tableCategory}>{row.category}</td>
              <td>{row.period}</td>
              <td className={styles.tableMuted}>{row.cliff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

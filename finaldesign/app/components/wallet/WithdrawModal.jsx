"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, Sparkles, Users, Wallet, X } from "lucide-react";
import styles from "./wallet.module.css";

export default function WithdrawModal({
  open,
  sources,
  connected,
  walletShort,
  busy,
  error,
  onClose,
  onConfirm,
}) {
  const [sourceKey, setSourceKey] = useState(sources[0]?.key || "");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    const first = sources.find((item) => item.available > 0) || sources[0];
    setSourceKey(first?.key || "");
    setAmount("");
  }, [open, sources]);

  if (!open) {
    return null;
  }

  const source = sources.find((item) => item.key === sourceKey) || sources[0];
  const value = Number(amount || 0);
  const overMax = source ? value > source.available + 1e-12 : true;
  const underMin = source ? value > 0 && value < source.min : true;
  const canSubmit = Boolean(source && value >= source.min && !overMax && !busy);

  return (
    <div className={styles.modalScrim} onClick={onClose} role="presentation">
      <aside className={styles.modal} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <header className={styles.modalHead}>
          <div>
            <p className={styles.kicker}>Withdraw</p>
            <h2>Send to Phantom</h2>
          </div>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <p className={styles.copy}>
          Choose a withdrawable balance, enter the amount, then confirm in Phantom. WLT stays locked until trade opens.
        </p>

        <div className={styles.sourceRow}>
          {sources.map((item) => {
            const Icon = item.key === "airdrop" ? Sparkles : Users;
            const disabled = item.available <= 0;
            return (
              <button
                key={item.key}
                type="button"
                disabled={disabled}
                className={sourceKey === item.key ? styles.sourceOn : styles.source}
                onClick={() => {
                  setSourceKey(item.key);
                  setAmount("");
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                <b>
                  {item.prefix}
                  {item.format(item.available)}
                </b>
              </button>
            );
          })}
        </div>

        <label className={styles.field} htmlFor="wallet-wd-amount">
          <span>
            Amount {source?.unit ? `(${source.unit})` : ""} · available {source ? `${source.prefix}${source.format(source.available)}` : "—"}
          </span>
          <div className={styles.inputWrap}>
            <b>{source?.prefix || ""}</b>
            <input
              id="wallet-wd-amount"
              type="number"
              min={source?.min || 0}
              step={source?.step || "any"}
              placeholder={source ? source.format(source.available) : "0"}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <button type="button" className={styles.maxBtn} onClick={() => setAmount(String(source?.available || ""))}>
              Max
            </button>
          </div>
        </label>

        <ul className={styles.modalMeta}>
          <li>
            <span>Destination</span>
            <b>{connected ? walletShort || "Phantom" : "Connect Phantom"}</b>
          </li>
          <li>
            <span>Minimum</span>
            <b>
              {source?.prefix}
              {source ? source.format(source.min) : "—"} {source?.unit}
            </b>
          </li>
        </ul>

        {overMax ? <p className={styles.error}>Amount is higher than the available balance.</p> : null}
        {underMin ? <p className={styles.error}>Enter at least the minimum amount.</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        <button
          className={styles.primaryWide}
          type="button"
          disabled={!canSubmit}
          onClick={() => onConfirm(source.key, value)}
        >
          <ArrowDownToLine size={15} />
          {busy ? "Confirming in Phantom..." : "Confirm withdraw"}
        </button>
        <p className={styles.modalHint}>
          <Wallet size={12} /> Phantom will ask you to sign this request.
        </p>
      </aside>
    </div>
  );
}

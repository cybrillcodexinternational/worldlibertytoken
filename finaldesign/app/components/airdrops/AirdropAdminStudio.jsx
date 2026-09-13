"use client";

import { useEffect, useState } from "react";
import styles from "./airdrop.module.css";
import admin from "./airdrop-admin.module.css";

const EMPTY = {
  settings: { solUsdRate: 140, saturdayHour: 21, autoRelease: true },
  stats: { sol: 0, payouts: 0, recipients: 0 },
  tiers: [],
  events: [],
  payouts: [],
};

function stamp(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

export default function AirdropAdminStudio() {
  const [data, setData] = useState(EMPTY);
  const [tiers, setTiers] = useState([]);
  const [settings, setSettings] = useState(EMPTY.settings);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function load() {
    const response = await fetch("/api/airdrop/admin", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Could not load airdrop admin.");
    }
    setData({ ...EMPTY, ...payload });
    setTiers(payload.tiers || []);
    setSettings(payload.settings || EMPTY.settings);
    return payload;
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function post(body, okNote) {
    setError("");
    setNote("");
    setBusy(body.action);
    try {
      const response = await fetch("/api/airdrop/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Action failed.");
      }
      setData({ ...EMPTY, ...payload });
      if (payload.tiers) {
        setTiers(payload.tiers);
      }
      if (payload.settings) {
        setSettings(payload.settings);
      }
      setNote(okNote);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  function updateTier(index, patch) {
    setTiers((current) => current.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  }

  return (
    <div className={styles.studio}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>Private control</p>
          <h1>Airdrop engine</h1>
          <p className={styles.lead}>
            Airdrop is a Saturday percent of the buyer’s own confirmed presale USD. That USD is converted to SOL at the
            live SOL/USD price when you distribute. Users never see these percentages before a drop is released.
            Four Saturday-night events per month. A fifth Saturday is ignored.
          </p>
        </div>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}
      {note ? <p className={styles.ok}>{note}</p> : null}

      <section className={styles.stats}>
        <article>
          <small>SOL distributed</small>
          <b>{Number(data.stats.sol || 0).toFixed(4)}</b>
        </article>
        <article>
          <small>Payouts</small>
          <b>{data.stats.payouts}</b>
        </article>
        <article>
          <small>Recipients</small>
          <b>{data.stats.recipients}</b>
        </article>
        <article>
          <small>Hour (UTC)</small>
          <b>{settings.saturdayHour}:00</b>
        </article>
      </section>

      <section className={admin.row}>
        <article className={styles.nextCard}>
          <p className={styles.kicker}>Schedule</p>
          <h2>Cycle slots</h2>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Slot</th>
                  <th>Saturday night</th>
                  <th>Status</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.cycleKey}</td>
                    <td>{event.slot} / 4</td>
                    <td>{stamp(event.scheduledAt)}</td>
                    <td>{event.status}</td>
                    <td>
                      {event.payoutCount} · {Number(event.solTotal || 0).toFixed(4)} SOL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className={styles.primary}
            type="button"
            disabled={Boolean(busy)}
            onClick={() => post({ action: "release" }, "Airdrop distributed. Amounts are now visible to recipients.")}
          >
            {busy === "release" ? "Distributing..." : "Distribute next airdrop now"}
          </button>
        </article>

        <article className={styles.withdrawCard}>
          <p className={styles.kicker}>Settings</p>
          <h2>Release rules</h2>
          <label className={styles.field}>
            <span>Fallback SOL / USD (used only if live price fails)</span>
            <input
              type="number"
              value={settings.solUsdRate}
              onChange={(event) => setSettings((current) => ({ ...current, solUsdRate: event.target.value }))}
            />
          </label>
          <label className={styles.field} style={{ marginTop: 12 }}>
            <span>Saturday hour (UTC)</span>
            <input
              type="number"
              min="0"
              max="23"
              value={settings.saturdayHour}
              onChange={(event) => setSettings((current) => ({ ...current, saturdayHour: event.target.value }))}
            />
          </label>
          <label className={admin.check}>
            <input
              type="checkbox"
              checked={Boolean(settings.autoRelease)}
              onChange={(event) => setSettings((current) => ({ ...current, autoRelease: event.target.checked }))}
            />
            Unused. Airdrops are sent only with Distribute next airdrop now — never when a user opens Wallet.
          </label>
          <button
            className={styles.primary}
            type="button"
            disabled={Boolean(busy)}
            onClick={() => post({ action: "settings", ...settings }, "Settings saved.")}
          >
            Save settings
          </button>
        </article>
      </section>

      <section className={styles.tableCard}>
        <p className={styles.kicker}>Private</p>
        <h2>Investment tiers and SOL rates</h2>
        <p className={styles.lead}>Never exposed on the user airdrop page.</p>
        <div className={admin.tiers}>
          {tiers.map((tier, index) => (
            <div key={tier.id || index} className={admin.tier}>
              <input value={tier.name} onChange={(event) => updateTier(index, { name: event.target.value })} />
              <input
                type="number"
                value={tier.minUsd}
                onChange={(event) => updateTier(index, { minUsd: event.target.value })}
                placeholder="Min USD"
              />
              <input
                type="number"
                value={tier.maxUsd}
                onChange={(event) => updateTier(index, { maxUsd: event.target.value })}
                placeholder="Max USD"
              />
              <input
                type="number"
                step="0.0001"
                value={tier.monthlyPct}
                onChange={(event) => updateTier(index, { monthlyPct: event.target.value })}
                placeholder="Monthly %"
              />
              <input
                type="number"
                step="0.0001"
                value={tier.weeklyPct}
                onChange={(event) => updateTier(index, { weeklyPct: event.target.value })}
                placeholder="Saturday %"
              />
              <button type="button" className={styles.ghost} onClick={() => setTiers((current) => current.filter((_, i) => i !== index))}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => setTiers((current) => [...current, { name: "New tier", minUsd: 0, maxUsd: "", monthlyPct: 0, weeklyPct: 0 }])}
        >
          Add tier
        </button>
        <button
          className={styles.primary}
          type="button"
          disabled={Boolean(busy)}
          onClick={() => post({ action: "tiers", tiers }, "Private tiers saved.")}
        >
          Save private rates
        </button>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import styles from "./achievements.module.css";

const EMPTY_FORM = {
  id: "",
  category: "personal",
  name: "",
  description: "",
  icon: "Medal",
  metric: "presale_usd",
  threshold: "",
  rewardNote: "",
  sortOrder: 0,
};

export default function AchievementAdminStudio() {
  const [data, setData] = useState({ badges: [], categories: [] });
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function load() {
    const response = await fetch("/api/achievements/admin", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Could not load badges.");
    }
    setData(payload);
    return payload;
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function save(event) {
    event.preventDefault();
    setError("");
    setNote("");
    const response = await fetch("/api/achievements/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || "Save failed.");
      return;
    }
    setData(payload);
    setForm(EMPTY_FORM);
    setNote("Badge saved.");
  }

  async function remove(id) {
    setError("");
    const response = await fetch("/api/achievements/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || "Delete failed.");
      return;
    }
    setData(payload);
    setNote("Badge removed.");
  }

  return (
    <div className={styles.studio}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>Admin</p>
          <h1>Achievement badges</h1>
          <p className={styles.lead}>
            Configure names, thresholds, icons, descriptions, and optional reward notes. Thresholds for personal and
            network badges are confirmed presale USD only.
          </p>
        </div>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}
      {note ? <p className={styles.ok}>{note}</p> : null}

      <section className={styles.adminCard}>
        <h2>{form.id ? "Edit badge" : "New badge"}</h2>
        <form className={styles.form} onSubmit={save}>
          <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
            {(data.categories || []).map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <input
            placeholder="Icon (Medal, Crown, Gem…)"
            value={form.icon}
            onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
          />
          <input
            placeholder="Metric (presale_usd, network_usd…)"
            value={form.metric}
            onChange={(event) => setForm((current) => ({ ...current, metric: event.target.value }))}
          />
          <input
            type="number"
            placeholder="Threshold"
            value={form.threshold}
            onChange={(event) => setForm((current) => ({ ...current, threshold: event.target.value }))}
            required
          />
          <input
            placeholder="Reward note (shown after unlock)"
            value={form.rewardNote}
            onChange={(event) => setForm((current) => ({ ...current, rewardNote: event.target.value }))}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <div className={styles.actions}>
            <button className={styles.primary} type="submit">
              Save badge
            </button>
            {form.id ? (
              <button className={styles.ghost} type="button" onClick={() => setForm(EMPTY_FORM)}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className={styles.adminCard}>
        <h2>Configured badges</h2>
        <div className={styles.list}>
          {(data.badges || []).map((badge) => (
            <article key={badge.id}>
              <div>
                <b>{badge.name}</b>
                <small>
                  {" "}
                  · {badge.category} · {badge.metric} ≥ {badge.threshold}
                </small>
              </div>
              <button className={styles.ghost} type="button" onClick={() => setForm(badge)}>
                Edit
              </button>
              <button className={styles.ghost} type="button" onClick={() => remove(badge.id)}>
                Delete
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

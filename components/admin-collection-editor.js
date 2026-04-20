"use client";

import { useState } from "react";

function makeLocalId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}

function withLocalId(item) {
  return {
    ...item,
    localId: makeLocalId(),
  };
}

export function AdminCollectionEditor({
  title,
  description,
  endpoint,
  fields,
  initialItems,
  emptyItem,
  addLabel = "Add row",
}) {
  const [items, setItems] = useState(initialItems.map(withLocalId));
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(localId, fieldName, value) {
    setItems((current) =>
      current.map((item) =>
        item.localId === localId
          ? {
              ...item,
              [fieldName]: value,
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [...current, withLocalId(emptyItem)]);
  }

  function removeItem(localId) {
    setItems((current) => current.filter((item) => item.localId !== localId));
  }

  async function saveItems() {
    setIsSaving(true);
    setStatus("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map(({ localId, id, ...item }) => item),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save changes.");
      }

      setItems(payload.items.map(withLocalId));
      setStatus("Saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="panel editor">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">Admin</span>
          <h2>{title}</h2>
        </div>
        <button className="button secondary" onClick={addItem} type="button">
          {addLabel}
        </button>
      </div>
      <p className="muted-copy">{description}</p>

      <div className="editor-stack">
        {items.map((item, index) => (
          <div className="editor-item" key={item.localId}>
            <div className="editor-item-header">
              <strong>Row {index + 1}</strong>
              <button
                className="text-button"
                onClick={() => removeItem(item.localId)}
                type="button"
              >
                Remove
              </button>
            </div>

            <div className="editor-grid">
              {fields.map((field) => {
                const value = item[field.name] ?? "";

                if (field.type === "textarea") {
                  return (
                    <label className="field field-span" key={field.name}>
                      <span>{field.label}</span>
                      <textarea
                        className="input textarea"
                        onChange={(event) =>
                          handleChange(item.localId, field.name, event.target.value)
                        }
                        placeholder={field.placeholder}
                        rows={field.rows || 4}
                        value={value}
                      />
                    </label>
                  );
                }

                if (field.type === "select") {
                  return (
                    <label className="field" key={field.name}>
                      <span>{field.label}</span>
                      <select
                        className="input"
                        onChange={(event) =>
                          handleChange(item.localId, field.name, event.target.value)
                        }
                        value={value}
                      >
                        {(field.options || []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                }

                return (
                  <label
                    className={`field ${field.fullWidth ? "field-span" : ""}`}
                    key={field.name}
                  >
                    <span>{field.label}</span>
                    <input
                      className="input"
                      onChange={(event) =>
                        handleChange(item.localId, field.name, event.target.value)
                      }
                      placeholder={field.placeholder}
                      step={field.type === "number" ? "any" : undefined}
                      type={field.type}
                      value={value}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {items.length === 0 ? <p className="empty-state">No rows yet.</p> : null}
      </div>

      <div className="editor-actions">
        <button className="button" disabled={isSaving} onClick={saveItems} type="button">
          {isSaving ? "Saving..." : "Save changes"}
        </button>
        <span className="status-copy">{status}</span>
      </div>
    </section>
  );
}

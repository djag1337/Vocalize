"use client";
import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function normalizeHex(hex: string): string {
  if (!hex) return "#000000";
  const h = hex.trim();
  if (!h.startsWith("#")) return "#" + h;
  return h;
}

export default function ColorPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input when value changes externally
  useEffect(() => {
    setHexInput(value);
  }, [value]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setHexInput(v);
    const norm = normalizeHex(v);
    if (/^#[0-9a-f]{6}$/i.test(norm)) {
      onChange(norm);
    }
  }

  function handlePickerChange(color: string) {
    onChange(color);
    setHexInput(color);
  }

  const normalizedValue = normalizeHex(value);
  const rgb = hexToRgb(normalizedValue);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger swatch */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Pick ${label}`}
        style={{
          width: 36,
          height: 36,
          borderRadius: 9999,
          background: normalizedValue,
          border: "2px solid var(--border)",
          cursor: "pointer",
          display: "block",
          boxShadow: open ? "0 0 0 3px var(--accent)" : "none",
          transition: "box-shadow 0.15s",
          flexShrink: 0,
        }}
      />

      {/* Popover */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            zIndex: 100,
            width: 220,
          }}
        >
          {/* Color wheel */}
          <HexColorPicker
            color={normalizedValue}
            onChange={handlePickerChange}
            style={{ width: "100%", height: 180 }}
          />

          {/* Hex input */}
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInput}
            className="input"
            style={{
              marginTop: 12,
              fontSize: 13,
              fontFamily: "monospace",
              padding: "8px 12px",
              borderRadius: 8,
            }}
            placeholder="#000000"
          />

          {/* RGB readout */}
          {rgb && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "var(--muted)",
                fontFamily: "monospace",
                display: "flex",
                gap: 12,
              }}
            >
              <span>R {rgb.r}</span>
              <span>G {rgb.g}</span>
              <span>B {rgb.b}</span>
            </div>
          )}

          {/* Preview bar */}
          <div
            style={{
              marginTop: 10,
              height: 28,
              borderRadius: 8,
              background: normalizedValue,
              border: "1px solid var(--border)",
            }}
          />
        </div>
      )}
    </div>
  );
}

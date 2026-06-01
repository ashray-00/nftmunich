"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Player {
  name: string;
  email: string;
}

interface AdminUser {
  name: string;
  email: string;
  is_super_admin: boolean;
}

interface ModalState {
  open: boolean;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  error: string;
  loading: boolean;
}

interface Toast {
  id: number;
  message: string;
}

const MODAL_DEFAULTS: ModalState = {
  open: false,
  name: "",
  email: "",
  isSuperAdmin: false,
  error: "",
  loading: false,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeader(): string {
  const token = typeof window !== "undefined" ? localStorage.getItem("nft_session") : null;
  return token ? `Bearer ${token}` : "";
}

// ---------------------------------------------------------------------------
// Toast component
// ---------------------------------------------------------------------------

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: "1.5rem",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      alignItems: "center",
    }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: "#1e7e34",
            color: "#fff",
            padding: "0.7rem 1.25rem",
            borderRadius: "8px",
            fontSize: "0.92rem",
            fontWeight: 500,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            whiteSpace: "nowrap",
          }}
        >
          <span>✓ {t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="search"
      placeholder="Search by name or email…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "0.55rem 0.8rem",
        border: "1px solid #ccc",
        borderRadius: "6px",
        fontSize: "0.95rem",
        marginBottom: "1rem",
        boxSizing: "border-box",
      }}
    />
  );
}

function Table({ rows }: { rows: { name: string; email: string }[] }) {
  if (rows.length === 0) {
    return <p style={{ color: "#777", fontSize: "0.9rem" }}>No results found.</p>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
        <thead>
          <tr style={{ background: "#1a3a6b", color: "#fff" }}>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.email} style={{ background: i % 2 === 0 ? "#f9f9f9" : "#fff" }}>
              <td style={tdStyle}>{i + 1}</td>
              <td style={tdStyle}>{row.name || <span style={{ color: "#aaa" }}>—</span>}</td>
              <td style={tdStyle}>{row.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({
  title,
  state,
  onChange,
  onClose,
  onSubmit,
  showSuperAdminToggle,
}: {
  title: string;
  state: ModalState;
  onChange: (patch: Partial<ModalState>) => void;
  onClose: () => void;
  onSubmit: () => void;
  showSuperAdminToggle?: boolean;
}) {
  if (!state.open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "2rem",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        {/* X close button */}
        <button
          onClick={onClose}
          disabled={state.loading}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "1.4rem",
            color: "#888",
            cursor: state.loading ? "not-allowed" : "pointer",
            lineHeight: 1,
            padding: "0 0.2rem",
          }}
          aria-label="Close"
        >
          ×
        </button>

        <h2 style={{ color: "#1a3a6b", marginTop: 0, marginBottom: "1.2rem", fontSize: "1.25rem", paddingRight: "2rem" }}>
          {title}
        </h2>

        <label style={labelStyle}>
          Full Name <span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value, error: "" })}
          placeholder="e.g. Max Mustermann"
          disabled={state.loading}
          style={inputStyle}
        />

        <label style={{ ...labelStyle, marginTop: "0.75rem" }}>
          Email Address <span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="email"
          value={state.email}
          onChange={(e) => onChange({ email: e.target.value, error: "" })}
          placeholder="email@example.com"
          disabled={state.loading}
          style={inputStyle}
        />

        {showSuperAdminToggle && (
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.9rem", cursor: "pointer", fontSize: "0.92rem", color: "#333" }}>
            <input
              type="checkbox"
              checked={state.isSuperAdmin}
              onChange={(e) => onChange({ isSuperAdmin: e.target.checked })}
              disabled={state.loading}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            Grant super admin privileges
          </label>
        )}

        {state.error && (
          <p style={{ color: "#c0392b", fontSize: "0.87rem", marginTop: "0.6rem", marginBottom: 0 }}>
            {state.error}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button
            onClick={onSubmit}
            disabled={state.loading}
            style={{
              flex: 1,
              padding: "0.7rem",
              background: state.loading ? "#8fa8c8" : "#1a3a6b",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: state.loading ? "not-allowed" : "pointer",
            }}
          >
            {state.loading ? "Adding…" : "Add"}
          </button>
          <button
            onClick={onClose}
            disabled={state.loading}
            style={{
              flex: 1,
              padding: "0.7rem",
              background: "#f0f0f0",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "0.95rem",
              cursor: state.loading ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline styles
// ---------------------------------------------------------------------------

const thStyle: React.CSSProperties = {
  padding: "0.65rem 0.9rem",
  textAlign: "left",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "0.6rem 0.9rem",
  borderBottom: "1px solid #eee",
  wordBreak: "break-all",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#1a3a6b",
  fontWeight: 600,
  fontSize: "0.9rem",
  marginBottom: "0.3rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "0.95rem",
  boxSizing: "border-box",
};

const sectionCardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "10px",
  padding: "1.5rem",
  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  marginBottom: "2rem",
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toastCounter = useRef(0);

  const [players, setPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState("");
  const [adminSearch, setAdminSearch] = useState("");

  const [playerModal, setPlayerModal] = useState<ModalState>(MODAL_DEFAULTS);
  const [adminModal, setAdminModal] = useState<ModalState>(MODAL_DEFAULTS);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || isSuperAdmin;

  const showToast = useCallback((message: string) => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/");
    }
  }, [authLoading, isAdmin, router]);

  const fetchPlayers = useCallback(async () => {
    setPlayersLoading(true);
    setPlayersError("");
    try {
      const res = await fetch("/api/admin/players", {
        headers: { authorization: authHeader() },
      });
      if (!res.ok) throw new Error("Failed to load players.");
      const data = await res.json();
      setPlayers(data.players ?? []);
    } catch {
      setPlayersError("Could not load player list. Please refresh.");
    } finally {
      setPlayersLoading(false);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    if (!isSuperAdmin) return;
    setAdminsLoading(true);
    setAdminsError("");
    try {
      const res = await fetch("/api/admin/admins", {
        headers: { authorization: authHeader() },
      });
      if (!res.ok) throw new Error("Failed to load admins.");
      const data = await res.json();
      setAdmins(data.admins ?? []);
    } catch {
      setAdminsError("Could not load admin list. Please refresh.");
    } finally {
      setAdminsLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchPlayers();
      fetchAdmins();
    }
  }, [isAdmin, fetchPlayers, fetchAdmins]);

  // ---------------------------------------------------------------------------
  // Add player
  // ---------------------------------------------------------------------------

  async function submitAddPlayer() {
    const name = playerModal.name.trim();
    const email = playerModal.email.trim();
    if (!name || !email) {
      setPlayerModal((s) => ({ ...s, error: "Both name and email are required." }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setPlayerModal((s) => ({ ...s, error: "Please enter a valid email address." }));
      return;
    }
    setPlayerModal((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: authHeader() },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setPlayerModal((s) => ({ ...s, loading: false, error: data.detail ?? "Player already exists." }));
        return;
      }
      if (!res.ok) {
        setPlayerModal((s) => ({ ...s, loading: false, error: data.detail ?? "Failed to add player." }));
        return;
      }
      setPlayerModal(MODAL_DEFAULTS);
      showToast(`${name} has been added.`);
      fetchPlayers();
    } catch {
      setPlayerModal((s) => ({ ...s, loading: false, error: "A network error occurred. Please try again." }));
    }
  }

  // ---------------------------------------------------------------------------
  // Add admin
  // ---------------------------------------------------------------------------

  async function submitAddAdmin() {
    const name = adminModal.name.trim();
    const email = adminModal.email.trim();
    if (!name || !email) {
      setAdminModal((s) => ({ ...s, error: "Both name and email are required." }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAdminModal((s) => ({ ...s, error: "Please enter a valid email address." }));
      return;
    }
    setAdminModal((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: authHeader() },
        body: JSON.stringify({ name, email, is_super_admin: adminModal.isSuperAdmin }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setAdminModal((s) => ({ ...s, loading: false, error: data.detail ?? "Admin already exists." }));
        return;
      }
      if (!res.ok) {
        setAdminModal((s) => ({ ...s, loading: false, error: data.detail ?? "Failed to add admin." }));
        return;
      }
      setAdminModal(MODAL_DEFAULTS);
      showToast(`${name} has been added as admin.`);
      fetchAdmins();
    } catch {
      setAdminModal((s) => ({ ...s, loading: false, error: "A network error occurred. Please try again." }));
    }
  }

  // ---------------------------------------------------------------------------
  // Filtered rows
  // ---------------------------------------------------------------------------

  const filteredPlayers = players.filter((p) => {
    const q = playerSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  const filteredAdmins = admins.filter((a) => {
    const q = adminSearch.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (authLoading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#1a3a6b" }}>Loading…</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div style={{ minHeight: "80vh", padding: "6rem 1.5rem 3rem", maxWidth: "900px", margin: "0 auto" }}>

      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "#1a3a6b", fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          Admin Panel
        </h1>
        <p style={{ color: "#555", fontSize: "0.92rem" }}>
          Signed in as <strong>{user?.email}</strong>
          {isSuperAdmin && (
            <span style={{ marginLeft: "0.5rem", background: "#1a3a6b", color: "#fff", fontSize: "0.75rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: "4px" }}>
              Super Admin
            </span>
          )}
          {user?.role === "admin" && (
            <span style={{ marginLeft: "0.5rem", background: "#4a7fc1", color: "#fff", fontSize: "0.75rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: "4px" }}>
              Admin
            </span>
          )}
        </p>
      </div>

      {/* Players section */}
      <div style={sectionCardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h2 style={{ color: "#1a3a6b", margin: 0, fontSize: "1.2rem" }}>
            Players
            {!playersLoading && (
              <span style={{ marginLeft: "0.6rem", color: "#777", fontSize: "0.9rem", fontWeight: 400 }}>
                ({filteredPlayers.length}{playerSearch ? ` of ${players.length}` : ""})
              </span>
            )}
          </h2>
          <button
            onClick={() => setPlayerModal({ ...MODAL_DEFAULTS, open: true })}
            style={{
              background: "#1a3a6b",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 1rem",
              fontSize: "0.92rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add Player
          </button>
        </div>

        <SearchBar value={playerSearch} onChange={setPlayerSearch} />

        {playersLoading ? (
          <p style={{ color: "#777" }}>Loading players…</p>
        ) : playersError ? (
          <p style={{ color: "#c0392b" }}>{playersError}</p>
        ) : (
          <Table rows={filteredPlayers} />
        )}
      </div>

      {/* Admins section — super admin only */}
      {isSuperAdmin && (
        <div style={sectionCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2 style={{ color: "#1a3a6b", margin: 0, fontSize: "1.2rem" }}>
              Admins
              {!adminsLoading && (
                <span style={{ marginLeft: "0.6rem", color: "#777", fontSize: "0.9rem", fontWeight: 400 }}>
                  ({filteredAdmins.length}{adminSearch ? ` of ${admins.length}` : ""})
                </span>
              )}
            </h2>
            <button
              onClick={() => setAdminModal({ ...MODAL_DEFAULTS, open: true })}
              style={{
                background: "#1a3a6b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "0.5rem 1rem",
                fontSize: "0.92rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Add Admin
            </button>
          </div>

          <SearchBar value={adminSearch} onChange={setAdminSearch} />

          {adminsLoading ? (
            <p style={{ color: "#777" }}>Loading admins…</p>
          ) : adminsError ? (
            <p style={{ color: "#c0392b" }}>{adminsError}</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
                <thead>
                  <tr style={{ background: "#1a3a6b", color: "#fff" }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ ...tdStyle, color: "#777" }}>No results found.</td>
                    </tr>
                  ) : (
                    filteredAdmins.map((a, i) => (
                      <tr key={a.email} style={{ background: i % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                        <td style={tdStyle}>{i + 1}</td>
                        <td style={tdStyle}>{a.name || <span style={{ color: "#aaa" }}>—</span>}</td>
                        <td style={tdStyle}>{a.email}</td>
                        <td style={tdStyle}>
                          <span style={{
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            padding: "0.15rem 0.45rem",
                            borderRadius: "4px",
                            background: a.is_super_admin ? "#1a3a6b" : "#4a7fc1",
                            color: "#fff",
                          }}>
                            {a.is_super_admin ? "Super Admin" : "Admin"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal
        title="Add New Player"
        state={playerModal}
        onChange={(patch) => setPlayerModal((s) => ({ ...s, ...patch }))}
        onClose={() => setPlayerModal(MODAL_DEFAULTS)}
        onSubmit={submitAddPlayer}
      />
      <Modal
        title="Add New Admin"
        state={adminModal}
        onChange={(patch) => setAdminModal((s) => ({ ...s, ...patch }))}
        onClose={() => setAdminModal(MODAL_DEFAULTS)}
        onSubmit={submitAddAdmin}
        showSuperAdminToggle
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

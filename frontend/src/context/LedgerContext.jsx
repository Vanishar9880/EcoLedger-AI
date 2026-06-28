import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const LedgerContext = createContext();

const API_URL = "http://localhost:5000/api/ledger";

export function LedgerProvider({ children }) {
  const { token, user } = useAuth();

  const [ledger, setLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const fetchLedger = async () => {
    if (!token) {
      setLedger([]);
      return;
    }

    try {
      setLedgerLoading(true);

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch ledger");
      }

      const normalizedData = data.map((item) => ({
  ...item,
  id: item._id,
}));

setLedger(normalizedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [token, user]);

  const addEntry = async (entry) => {
    if (!token) return;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(entry),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add ledger entry");
    }

    const normalizedEntry = {
  ...data,
  id: data._id,
};

setLedger((prev) => [normalizedEntry, ...prev]);
  };

  const deleteEntry = async (id) => {
    if (!token) return;

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete entry");
    }

    setLedger((prev) => prev.filter((item) => item.id !== id));
  };

  const totalEmissions = ledger.reduce(
    (sum, item) => sum + Number(item.co2 || 0),
    0
  );

  return (
    <LedgerContext.Provider
      value={{
        ledger,
        ledgerLoading,
        fetchLedger,
        addEntry,
        deleteEntry,
        totalEmissions,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  return useContext(LedgerContext);
}
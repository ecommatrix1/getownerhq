import React, { createContext, useContext, useEffect, useState } from "react";
import { Gym } from "../types";
import { api } from "../lib/api";

interface DashboardContextValue {
  gym: Gym | null;
  isReadOnly: boolean;
  loading: boolean;
  refreshGym: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue>({
  gym: null,
  isReadOnly: false,
  loading: true,
  refreshGym: async () => {},
});

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshGym = async () => {
    setLoading(true);
    try {
      const currentGym = await api.getCurrentGym();
      setGym(currentGym);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGym();
  }, []);

  const daysRemainingInTrial = () => {
    if (!gym || gym.subscription_status !== "trial" || !gym.trial_ends_at)
      return 0;
    const ends = new Date(gym.trial_ends_at).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((ends - now) / (1000 * 60 * 60 * 24)));
  };

  const isReadOnly =
    !!gym &&
    ((gym.subscription_status === "trial" && daysRemainingInTrial() <= 0) ||
      gym.subscription_status === "cancelled" ||
      gym.subscription_status === "past_due");

  return (
    <DashboardContext.Provider value={{ gym, isReadOnly, loading, refreshGym }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);

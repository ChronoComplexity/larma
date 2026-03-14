"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";

export function useAlarmStatus(): { alarmSet: boolean; alarmTime: string | null; phone: string | null; loading: boolean } {
  const { user } = useAuth();
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmTime, setAlarmTime] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = user?.uid;
    const firestore = db;
    if (!uid || !firestore) {
      setAlarmSet(false);
      setAlarmTime(null);
      setPhone(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAlarm() {
      try {
        const userDoc = await getDoc(doc(firestore!, "users", uid!));
        if (cancelled) return;
        const data = userDoc.data();
        const time = data?.alarmTime ?? null;
        setAlarmSet(Boolean(time));
        setAlarmTime(typeof time === "string" ? time : null);
        setPhone(typeof data?.phone === "string" ? data.phone : null);
      } catch {
        if (!cancelled) {
          setAlarmSet(false);
          setAlarmTime(null);
          setPhone(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAlarm();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  return { alarmSet, alarmTime, phone, loading };
}

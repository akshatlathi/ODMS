"use client";

import { useRef, useEffect, useState } from "react";

export type FieldAnalytics = {
  fieldName: string;
  timeSpentMs: number;
  interactionCount: number;
};

export type SurveyAnalytics = {
  userAgent: string;
  screenResolution: string;
  timeZone: string;
  tabSwitchCount: number;
  honeypotTriggered: boolean;
  totalTimeSpent: number;
  fields: FieldAnalytics[];
};

export function useFormAnalytics() {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [honeypotTriggered, setHoneypotTriggered] = useState(false);
  const [globalStartTime] = useState(Date.now());
  
  const fieldData = useRef<Record<string, FieldAnalytics>>({});
  const activeFieldStart = useRef<{ fieldName: string; startTime: number } | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        
        // If they leave the tab, stop the timer for the active field
        if (activeFieldStart.current) {
          const { fieldName, startTime } = activeFieldStart.current;
          const timeSpent = Date.now() - startTime;
          
          if (!fieldData.current[fieldName]) {
            fieldData.current[fieldName] = { fieldName, timeSpentMs: 0, interactionCount: 0 };
          }
          fieldData.current[fieldName].timeSpentMs += timeSpent;
          activeFieldStart.current = null;
        }
      } else {
        // We don't know what field they'll come back to until they focus again
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleFocus = (fieldName: string) => {
    activeFieldStart.current = { fieldName, startTime: Date.now() };
  };

  const handleBlur = (fieldName: string) => {
    if (activeFieldStart.current && activeFieldStart.current.fieldName === fieldName) {
      const timeSpent = Date.now() - activeFieldStart.current.startTime;
      
      if (!fieldData.current[fieldName]) {
        fieldData.current[fieldName] = { fieldName, timeSpentMs: 0, interactionCount: 0 };
      }
      fieldData.current[fieldName].timeSpentMs += timeSpent;
      activeFieldStart.current = null;
    }
  };

  const handleChange = (fieldName: string) => {
    if (!fieldData.current[fieldName]) {
      fieldData.current[fieldName] = { fieldName, timeSpentMs: 0, interactionCount: 0 };
    }
    fieldData.current[fieldName].interactionCount += 1;
  };

  const triggerHoneypot = () => {
    setHoneypotTriggered(true);
  };

  const getAnalyticsPayload = (): SurveyAnalytics => {
    // End the timer for any currently active field
    if (activeFieldStart.current) {
      handleBlur(activeFieldStart.current.fieldName);
    }

    return {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'unknown',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      tabSwitchCount,
      honeypotTriggered,
      totalTimeSpent: Date.now() - globalStartTime,
      fields: Object.values(fieldData.current),
    };
  };

  return {
    handleFocus,
    handleBlur,
    handleChange,
    triggerHoneypot,
    getAnalyticsPayload,
  };
}

"use client";

import { useDemoSession } from "@/contexts/DemoSessionContext";
import LeaveDemoButton from "@/components/LeaveDemoButton";

export default function GlobalLeaveDemoButton() {
  const { hasActiveSession, activeDemoType, endSession } = useDemoSession();

  if (!hasActiveSession || !activeDemoType) {
    return null;
  }

  // Map demo types to display names
  const demoNameMap: Record<string, string> = {
    'loan': 'Loan Application',
    'nysc': 'NYSC Registration',
    'course-registration': 'Course Registration',
    'student-card': 'Student Card',
    'statement-of-results': 'Statement of Results',
    'medical-fitness': 'Medical Fitness',
  };

  const demoName = demoNameMap[activeDemoType] || activeDemoType;

  return (
    <LeaveDemoButton
      demoType={activeDemoType}
      demoName={demoName}
      onLeave={() => {
        // Update context when leaving
        endSession();
      }}
    />
  );
}

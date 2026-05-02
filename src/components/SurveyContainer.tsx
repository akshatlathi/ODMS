"use client";

import { useState, useMemo, useEffect } from "react";
import { useFormAnalytics } from "../hooks/useFormAnalytics";
import { motion, AnimatePresence } from "framer-motion";
import { submitSurveyAction } from "../app/actions";
import styles from "./SurveyContainer.module.css";

type QuestionType = "intro" | "single" | "multiple" | "scale" | "text" | "closing" | "success";

interface QuestionDef {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  max?: number;
  placeholder?: string;
  condition?: (answers: Record<string, any>) => boolean;
}

const SURVEY_QUESTIONS: QuestionDef[] = [
  { id: "intro", type: "intro", text: "" },
  // Section A
  { id: "Q1", type: "single", text: "Which of the following best describes your household on campus?", options: ["I live alone", "I live with my spouse / partner", "I live with spouse / partner and children", "I live with elderly parent(s) or family member(s)", "Joint family (multiple generations)"] },
  { id: "Q2", type: "single", text: "On a typical working week, how much time do you estimate is spent on household tasks — cleaning, errands, coordination — that you'd rather not be doing yourself?", options: ["Less than 1 hour", "1–3 hours", "3–6 hours", "More than 6 hours"] },
  { id: "Q3", type: "single", text: "How do you currently manage household help?", options: ["We have a regular maid / helper we found ourselves", "We rely on whoever is available — no fixed arrangement", "We mostly manage on our own", "We use a service or platform occasionally"] },
  { id: "Q3_details", type: "text", text: "What specific tasks or services do they help you with?", placeholder: "e.g. cleaning, cooking, dishwashing", condition: (a) => a["Q3"] === "We use a service or platform occasionally" || a["Q3"] === "We have a regular maid / helper we found ourselves" },
  { id: "Q4", type: "single", text: "When your regular helper is unavailable or absent, what typically happens?", options: ["We manage ourselves — it's a stressful day", "We call around to find someone — usually takes time", "We have a backup arrangement", "This rarely happens"] },
  
  // Section B
  { id: "Q5", type: "multiple", text: "If a verified, on-demand home service were available on campus — bookable same-day via an app — which of the following would your household realistically use?", options: ["General house cleaning (floors, dusting, common areas)", "Kitchen deep clean and dishwashing", "Bathroom cleaning", "Laundry assistance", "Car washing / exterior cleaning", "Salon / beauty services at home (haircut, threading, waxing)", "AC servicing and deep cleaning", "Appliance repair (minor — fan, geyser, etc.)", "None of the above"] },
  { id: "Q6", type: "single", text: "For services you selected above — how often would you expect to book them in a typical month?", options: ["Once or less", "2–4 times", "5–8 times", "More than 8 times"] },
  { id: "Q7", type: "single", text: "The last time you needed a specific home service done (cleaning, repair, salon, etc.) and couldn't arrange it easily — what did you do?", options: ["Did it myself, even though I didn't want to", "Left it undone for days", "Asked a colleague or neighbour for a contact", "Searched online / called a local service", "This hasn't happened recently"] },
  { id: "Q8", type: "multiple", text: "What matters most to you when hiring someone for home services on campus?", max: 2, options: ["Background-verified, trustworthy provider", "Same-day availability", "Fixed, transparent pricing", "Quality / skill of the worker", "Ability to rate and give feedback"] },
  { id: "Q9", type: "single", text: "For a standard 2-hour house cleaning session, what range feels fair to you?", options: ["Under ₹200", "₹200 – ₹350", "₹350 – ₹500", "₹500 – ₹700", "Above ₹700 if quality is assured"] },

  // Section C (Conditional)
  { id: "Q10", type: "multiple", text: "Thinking about the elderly or dependent family members in your household — which of the following has been a source of stress or difficulty in the last 6 months?", options: ["Managing their daily routine when I'm at work", "Getting them to doctor appointments or follow-ups", "Managing their medicines and health tracking", "Finding trained, trustworthy help for personal care", "Post-surgery or recovery care at home", "Loneliness or lack of companionship during the day", "None — we manage well"], condition: (a) => !(a.Q1 === "I live alone" || a.Q1 === "I live with my spouse / partner") },
  { id: "Q11", type: "single", text: "How is your elderly family member's care currently managed during your working hours?", options: ["A family member (spouse, child) looks after them", "A hired caretaker / attendant we found ourselves", "They are largely independent and self-sufficient", "We manage in shifts — it's a constant coordination effort", "We don't have a good solution currently"], condition: (a) => !(a.Q1 === "I live alone" || a.Q1 === "I live with my spouse / partner") },
  { id: "Q12", type: "multiple", text: "If a professional, trained caregiver — verified, with documented credentials — were available on-demand or on a scheduled basis on campus, which services would be relevant for your household?", options: ["Daytime companionship and assistance (a few hours/day)", "Daily vital monitoring (BP, sugar, SPO2)", "Medication management and reminders", "Post-surgery or recovery care at home", "Personal hygiene assistance (bathing, grooming)", "Physiotherapy or mobility support", "None currently relevant"], condition: (a) => !(a.Q1 === "I live alone" || a.Q1 === "I live with my spouse / partner") },
  { id: "Q13", type: "single", text: "Would a monthly subscription model for elderly care — fixed caregiver, scheduled visits, known monthly cost — be preferable over booking on-demand each time?", options: ["Strongly prefer subscription — predictability matters", "Prefer on-demand — needs vary too much", "Would want both options available", "Not sure yet"], condition: (a) => !(a.Q1 === "I live alone" || a.Q1 === "I live with my spouse / partner") },
  { id: "Q14", type: "single", text: "For a 4-hour daytime caregiver visit (trained, verified, with care notes), what monthly spend feels reasonable if the service is high quality and consistent?", options: ["Under ₹3,000/month", "₹3,000 – ₹6,000/month", "₹6,000 – ₹10,000/month", "Above ₹10,000/month — quality is worth it", "Not in a position to pay — would need free/subsidised options"], condition: (a) => !(a.Q1 === "I live alone" || a.Q1 === "I live with my spouse / partner") },

  // Section D
  { id: "Q15", type: "single", text: "In the last 6 months, how many times did you or someone in your household need medical attention but found it inconvenient or difficult to access?", options: ["Never — BC Roy or other options worked fine", "Once or twice — minor inconvenience", "3–5 times — it was a real problem", "More than 5 times — this is an ongoing issue"] },
  { id: "Q16", type: "multiple", text: "Which of the following would make the biggest difference to your household's healthcare experience on campus?", max: 2, options: ["A doctor who can come to my home for consultation", "Medicine delivered to my door without going to a pharmacy", "Lab tests done at home — no travel required", "Video consultation for non-emergency symptoms — quick, no queue", "Specialist consultation arranged and scheduled easily", "A single point of contact who coordinates all of the above"] },
  { id: "Q17", type: "scale", text: "If a comprehensive at-home healthcare service were available on campus — covering consultation, medicine, and lab tests — how likely would you be to use it for non-emergency situations, even if there is a fee involved?" },

  // Closing
  { id: "Q18", type: "single", text: "If any of these services launched on campus, would you be open to a brief 10-minute follow-up conversation to help us get it right?", options: ["Yes — happy to share more (please collect contact details)", "No — this response is enough"] },
  { id: "Q19", type: "text", text: "Your name and best contact (email or phone)", placeholder: "John Doe, +91 9876543210", condition: (a) => a.Q18?.startsWith("Yes") },
  
  { id: "closing", type: "closing", text: "" },
  { id: "success", type: "success", text: "" }
];

export default function SurveyContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const analytics = useFormAnalytics();

  // Compute the active path of questions based on conditions
  const activeQuestions = useMemo(() => {
    return SURVEY_QUESTIONS.filter(q => !q.condition || q.condition(answers));
  }, [answers]);

  // Adjust index if conditions change and current index becomes out of bounds
  useEffect(() => {
    if (currentIndex >= activeQuestions.length) {
      setCurrentIndex(activeQuestions.length - 1);
    }
  }, [activeQuestions.length, currentIndex]);

  const currentQ = activeQuestions[currentIndex];

  const handleAnswerChange = (qId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    analytics.handleChange(qId);
  };

  const handleFocus = (qId: string) => analytics.handleFocus(qId);
  const handleBlur = (qId: string) => analytics.handleBlur(qId);

  // Track screen time for progressive disclosure UI
  useEffect(() => {
    if (currentQ.type !== 'intro' && currentQ.type !== 'closing' && currentQ.type !== 'success') {
      analytics.handleFocus(currentQ.id);
      return () => {
        analytics.handleBlur(currentQ.id);
      };
    }
  }, [currentQ.id]);

  const goNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSingleChoiceSelect = (qId: string, opt: string) => {
    handleAnswerChange(qId, opt);
    // Auto-advance for speed on mobile, with a tiny delay for visual feedback
    setTimeout(() => goNext(), 300);
  };

  // Keyboard navigation for 'Enter'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && currentQ.type !== 'intro' && currentQ.type !== 'closing' && currentQ.type !== 'success') {
        // Only allow enter to proceed if it's answered (except multiple which is optional or text)
        if (currentQ.type === 'single' && !answers[currentQ.id]) return;
        goNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, answers, currentQ]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = analytics.getAnalyticsPayload();
    try {
      await submitSurveyAction(answers, payload);
      goNext(); // Go to success
    } catch (e) {
      console.error(e);
      alert("There was an error submitting the survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentIndex / (activeQuestions.length - 1)) * 100;

  // Variants for fast, smooth sliding
  const variants = {
    initial: { opacity: 0, y: 30, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, filter: "blur(4px)", transition: { duration: 0.2, ease: "easeIn" } }
  };

  return (
    <div className={styles.container}>
      {/* Honeypot */}
      <input type="text" name="email_website" style={{ display: "none" }} tabIndex={-1} onChange={() => analytics.triggerHoneypot()} />

      {/* Progress Bar */}
      {currentQ.type !== 'intro' && currentQ.type !== 'success' && (
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}></div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQ.id} 
          className={styles.questionContainer}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          
          {currentQ.type === "intro" && (
            <div className={styles.heroSection}>
              <h1 className={styles.title}>Zlice <span className={styles.titleHighlight}>× Setu</span></h1>
              <p className={styles.subtitle}>Help us design an upcoming suite of premium, on-demand home and healthcare services.</p>
              
              <div className={styles.introAction}>
                <button className={styles.primaryButton} onClick={goNext}>Begin Survey <span className={styles.shortcutHint}>Press Enter ↵</span></button>
              </div>
            </div>
          )}

          {(currentQ.type === "single" || currentQ.type === "multiple" || currentQ.type === "scale" || currentQ.type === "text") && (
            <div className={styles.activeQuestionBlock}>
              <h2 className={styles.massiveTypography}>
                {currentQ.text}
                {currentQ.max && <span className={styles.questionHint}>(Select up to {currentQ.max})</span>}
              </h2>

              <div className={styles.optionsWrapper}>
                {currentQ.type === "single" && currentQ.options?.map((opt, i) => (
                  <button 
                    key={opt}
                    onClick={() => handleSingleChoiceSelect(currentQ.id, opt)}
                    className={`${styles.animatedOption} ${answers[currentQ.id] === opt ? styles.selected : ''}`}
                  >
                    <div className={styles.optionKey}>{String.fromCharCode(65 + i)}</div>
                    <span>{opt}</span>
                  </button>
                ))}

                {currentQ.type === "multiple" && currentQ.options?.map((opt, i) => (
                  <button 
                    key={opt}
                    onClick={() => {
                      const current = answers[currentQ.id] || [];
                      let newArr;
                      if (current.includes(opt)) {
                        newArr = current.filter((item: string) => item !== opt);
                      } else {
                        if (currentQ.max && current.length >= currentQ.max) return;
                        newArr = [...current, opt];
                      }
                      handleAnswerChange(currentQ.id, newArr);
                    }}
                    className={`${styles.animatedOption} ${(answers[currentQ.id] || []).includes(opt) ? styles.selected : ''}`}
                  >
                    <div className={styles.optionKey}>{String.fromCharCode(65 + i)}</div>
                    <span>{opt}</span>
                  </button>
                ))}

                {currentQ.type === "text" && (
                  <input
                    type="text"
                    className={styles.massiveInput}
                    value={answers[currentQ.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    placeholder={currentQ.placeholder}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && goNext()}
                  />
                )}

                {currentQ.type === "scale" && (
                  <div className={styles.scaleContainer}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleSingleChoiceSelect(currentQ.id, String(num))}
                        className={`${styles.scaleOption} ${answers[currentQ.id] === String(num) ? styles.selected : ''}`}
                      >
                        {num}
                      </button>
                    ))}
                    <div className={styles.scaleLabels}>
                      <span>Very unlikely</span>
                      <span>Definitely yes</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentQ.type === "closing" && (
            <div className={styles.activeQuestionBlock}>
              <h2 className={styles.massiveTypography}>Almost done!</h2>
              <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>Please review your answers or submit.</p>
              <button className={styles.submitButton} onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting securely..." : "Submit Survey"}
              </button>
            </div>
          )}

          {currentQ.type === "success" && (
            <div className={styles.successBlock}>
              <div className={styles.successIcon}>✓</div>
              <h2 className={styles.massiveTypography}>Thank you.</h2>
              <p className={styles.subtitle}>Your insights will help shape the future of campus services.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls (Hidden on Intro and Success) */}
      {currentQ.type !== 'intro' && currentQ.type !== 'success' && (
        <div className={styles.navigationControls}>
          <button className={styles.navButton} onClick={goPrev} disabled={currentIndex === 1}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          {currentQ.type !== 'closing' && (
             <button 
              className={`${styles.navButton} ${styles.primaryNav}`} 
              onClick={goNext}
              disabled={(currentQ.type === 'single' || currentQ.type === 'scale') && !answers[currentQ.id]}
            >
              OK <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

"use server";

import { PrismaClient } from "@prisma/client";
import { SurveyAnalytics } from "../hooks/useFormAnalytics";

// Instantiate PrismaClient
const prisma = new PrismaClient();

export async function submitSurveyAction(answers: Record<string, any>, analytics: SurveyAnalytics) {
  try {
    console.log("=== ANALYTICS PAYLOAD RECEIVED ===");
    console.log(JSON.stringify(analytics, null, 2));
    
    // If honeypot is triggered, we can either reject it or save it marked as fake
    if (analytics.honeypotTriggered) {
      console.warn("Honeypot triggered. Likely a bot submission.");
    }

    const createdResponse = await prisma.response.create({
      data: {
        householdType: answers["Q1"],
        householdTasksTime: answers["Q2"],
        manageHelper: answers["Q3"],
        manageHelperDetails: answers["Q3_details"],
        helperAbsent: answers["Q4"],
        
        homeServices: Array.isArray(answers["Q5"]) ? answers["Q5"] : [],
        serviceFrequency: answers["Q6"],
        serviceIssues: answers["Q7"],
        hiringCriteria: Array.isArray(answers["Q8"]) ? answers["Q8"] : [],
        cleaningPrice: answers["Q9"],
        
        elderlyStress: Array.isArray(answers["Q10"]) ? answers["Q10"] : [],
        elderlyCareCurrent: answers["Q11"],
        elderlyServices: Array.isArray(answers["Q12"]) ? answers["Q12"] : [],
        elderlySubscription: answers["Q13"],
        caregiverPrice: answers["Q14"],
        
        healthcareIssues: answers["Q15"],
        healthcareExperience: Array.isArray(answers["Q16"]) ? answers["Q16"] : [],
        healthcareLikelihood: answers["Q17"] ? parseInt(answers["Q17"], 10) : null,
        
        followUpOpen: answers["Q18"],
        contactInfo: answers["Q19"],

        analytics: {
          create: {
            userAgent: analytics.userAgent,
            screenResolution: analytics.screenResolution,
            timeZone: analytics.timeZone,
            tabSwitchCount: analytics.tabSwitchCount,
            honeypotTriggered: analytics.honeypotTriggered,
            totalTimeSpent: analytics.totalTimeSpent,
            fieldAnalytics: {
              create: analytics.fields.map((field) => ({
                fieldName: field.fieldName,
                timeSpentMs: field.timeSpentMs,
                interactionCount: field.interactionCount,
              }))
            }
          }
        }
      }
    });

    return { success: true, id: createdResponse.id };
  } catch (error) {
    console.error("Error submitting survey:", error);
    throw new Error("Failed to save survey response");
  }
}

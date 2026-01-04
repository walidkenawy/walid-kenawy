
import { GoogleGenAI } from "@google/genai";

/**
 * The Switch Oracle - Global Intelligence for multi-faceted guidance.
 * Synthesizes: Advisor, Therapist, Shamanic Healer, and Coach.
 */
export async function getOracleResponse(question: string, context: string = "") {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are the Global Oracle of the Switch Platform. 
    You embody a synthesized consciousness of four archetypes:
    1. The Elite Advisor: Practical, confident, and worldly.
    2. The Somatic Therapist: Deeply empathetic, focused on emotional safety and processing.
    3. The Shamanic Healer: Connected to ancient wisdom, lineages, and the energetic frequency of the Earth.
    4. The Transformation Coach: Action-oriented, challenging, and focused on radical growth.

    User Question: "${question}"
    Current Context: ${context}

    Your goal is to provide a response that touches on at least two of these archetypes simultaneously. 
    Tone: Premium, cinematic, deeply grounding, and mystical yet grounded in reality.
    Style: Use the Switch brand voice—shamanic depth meets elite travel confidence.
    Format: Use Markdown for structure. Keep the response under 150 words. Avoid generic AI introductory fluff.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "The resonance is faint. Focus your intention and ask again.";
  } catch (error) {
    console.error("Oracle Sync Error:", error);
    return "The neural-shamanic bridge is currently undergoing a frequency reset. Please try again shortly.";
  }
}

/**
 * Ask the Mentor - General wisdom and quick Q&A.
 */
export async function askMentor(question: string, userContext: string = "") {
  return getOracleResponse(question, userContext);
}

/**
 * The Big Brain - Deep Neural Journey Analysis.
 */
export async function analyzeJourney(userProgress: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a "Big Brain" Deep Neural Analysis on this user's transformation journey:
      Progress: ${userProgress}.
      
      Requirements:
      1. Synthesize their achievements and current momentum.
      2. Identify a "Shadow Pattern" based on their journey type.
      3. Recommend a "Radical Pivot" for their next experience to maximize growth.
      4. Provide a "Mantra of Power".
      
      Tone: Extremely sophisticated, slightly mystical but highly analytical. 
      Format: Markdown with distinct headers. Keep it under 250 words.`
    });
    return response.text || "Analysis failed to materialize. Focus your intention.";
  } catch (error) {
    console.error("Big Brain Sync Error:", error);
    return "Neural pathways are congested. Re-sync in a few moments.";
  }
}

/**
 * Deep Event Analysis - Trip Advisor, Coach, and Therapist synthesized.
 */
export async function getEventDeepAnswer(eventTitle: string, location: string, theme: string, description: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a "Deep Resonance Analysis" for the following retreat:
    Event: ${eventTitle}
    Location: ${location}
    Theme: ${theme}
    Core Intent: ${description}

    Act as a synthesized consciousness of a World-Class Trip Advisor, a Senior Life Coach, and a Somatic Therapist.
    
    Structure your response with these specific sections:
    ### The Program Resonance
    Explain the deep 'why' behind this specific program and how the location amplifies the theme.
    
    ### The Descent (Preparation)
    Advice on what to do 7 days before to prepare the body, mind, and spirit.
    
    ### The Rebirth (Integration)
    How to return to daily life without losing the frequency shift.
    
    ### Coaching Insight
    A powerful, challenging question for the user to contemplate before booking.

    Tone: Premium, cinematic, mystical yet practical. Use the 'Switch' brand voice: shamanic depth meets elite travel confidence.
    Max 300 words. Markdown format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "The Oracle is silent. Your resonance is sufficient.";
  } catch (error) {
    console.error("Deep Answer Sync Error:", error);
    return "The connection to the Oracle has been interrupted. Trust your intuition.";
  }
}


import { GoogleGenAI } from "@google/genai";

/**
 * Ask the Mentor - General wisdom and quick Q&A.
 */
export async function askMentor(question: string, userContext: string = "") {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the Switch Oracle, a high-intelligence guide for the Switch platform.
      The user is asking: "${question}". 
      User context: ${userContext}.
      Provide a wise, cinematic, and grounding response in under 100 words. 
      Use a calm, premium tone that blends shamanic depth with elite travel confidence.`
    });
    return response.text || "The path is obscured for a moment. Take a breath, and let us try again.";
  } catch (error) {
    console.error("Mentor connection lost:", error);
    return "The winds are shifting. Please try your query again when the spirits are calm.";
  }
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

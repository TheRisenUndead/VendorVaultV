import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the free Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { image } = await request.json(); 
    
    // Ensure we actually got a valid string before trying to split it
    if (!image || !image.includes(',')) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    // Strip the "data:image/jpeg;base64," prefix so Gemini can read it
    const base64Data = image.split(',')[1];

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    // PURE ASCII PROMPT (No accents or special characters)
    const prompt = `You are an expert TCG grader. Analyze the Pokemon card in the image. 
    Return a JSON object with strictly these keys:
    - "cardDetected" (boolean): true if a card is clearly visible.
    - "pokemonName" (string): The name of the Pokemon (e.g. Charizard ex).
    - "cardNumber" (string): The collector number at the bottom corner (e.g., '172/151', '36/114', or '001/165').
    If no card is clearly visible, return {"cardDetected": false}.`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    const aiData = JSON.parse(responseText);

    if (!aiData.cardDetected || !aiData.pokemonName || !aiData.cardNumber) {
      return NextResponse.json({ cardDetected: false });
    }

    // Isolate the prefix number (e.g., "172/151" becomes "172")
    const printedNumber = aiData.cardNumber.split('/')[0].replace(/[^a-zA-Z0-9]/g, ''); 

    // Query the Pokemon TCG API
    const tcgResponse = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=name:"${aiData.pokemonName}" number:"${printedNumber}"`,
      { headers: { 'X-Api-Key': process.env.POKEMONTCG_API_KEY || '' } }
    );

    const tcgData = await tcgResponse.json();

    if (tcgData.data && tcgData.data.length > 0) {
      return NextResponse.json({ 
        cardDetected: true, 
        cardId: tcgData.data[0].id,
        metadata: {
          name: tcgData.data[0].name,
          set: tcgData.data[0].set.name,
        }
      });
    } else {
      return NextResponse.json({ cardDetected: false });
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
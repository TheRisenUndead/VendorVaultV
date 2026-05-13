import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { image } = await request.json(); 
    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const base64Data = image.split(',')[1];
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // We can use 1.5-flash as it is lightning fast for small text reading
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // REWORKED PROMPT: Focus entirely on the Set Code and Number
    const prompt = `You are an expert TCG barcode reader. Analyze this close-up of a Pokemon card's bottom corner. 
    Extract the 'setCode' (e.g., 'sv6', 'MEW', 'PAL', 'SV3pt5') and the 'cardNumber' (e.g., '112/101', '172/165').
    Return ONLY a JSON object: {"cardDetected": true, "setCode": "sv6", "cardNumber": "112/101"}. 
    If you cannot read both clearly, return {"cardDetected": false}.`;

    const imagePart = {
      inlineData: { data: base64Data, mimeType: "image/jpeg" },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = await result.response.text();
    
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    let aiData;
    try {
      aiData = JSON.parse(cleanJson);
    } catch (e) {
      return NextResponse.json({ cardDetected: false, error: "AI formatting error" });
    }

    if (!aiData.cardDetected || !aiData.cardNumber || !aiData.setCode) {
      return NextResponse.json({ cardDetected: false });
    }

    console.log(`AI identified Set: ${aiData.setCode}, Number: ${aiData.cardNumber}`);

    // Clean the extracted data (e.g., "112/101 AR" becomes "112")
    const cleanNumber = aiData.cardNumber.split('/')[0].replace(/[^0-9]/g, ''); 
    const cleanSet = aiData.setCode.toLowerCase();

    // Query the database for ALL cards with this number
    const tcgResponse = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=number:"${cleanNumber}"`,
      { headers: { 'X-Api-Key': process.env.POKEMONTCG_API_KEY || '' } }
    );

    const tcgData = await tcgResponse.json();

    if (tcgData.data && tcgData.data.length > 0) {
      
      // Filter the results to find the card that belongs to the scanned Set Code
      let matchedCard = tcgData.data.find(card => 
        card.id.toLowerCase().includes(cleanSet) || 
        card.set.id.toLowerCase().includes(cleanSet) ||
        (card.set.ptcgoCode && card.set.ptcgoCode.toLowerCase() === cleanSet)
      );

      // If we couldn't perfectly match the set string, default to the first result
      if (!matchedCard) {
        matchedCard = tcgData.data[0];
      }

      return NextResponse.json({ 
        cardDetected: true, 
        cardId: matchedCard.id,
        metadata: { name: matchedCard.name, set: matchedCard.set.name }
      });
    }

    return NextResponse.json({ cardDetected: false, reason: "Card not found in database" });

  } catch (error) {
    console.error("DETAILED SERVER ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
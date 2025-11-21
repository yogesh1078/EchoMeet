import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Define interfaces for the transcript messages
interface TranscriptMessage {
    speaker_id: string;
    type: string;
    text: string;
    start_ts: number;
    stop_ts: number;
}

interface EmotionAnalysis {
    message: string;
    emotion: string;
    confidence: string;
    timestamp: number;
    speaker_id: string;
    text: string; // Adding text field explicitly
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function fetchTranscriptContent(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch transcript: ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching transcript:', error);
        throw new Error('Failed to fetch transcript from URL');
    }
}

function parseTranscriptContent(content: string): TranscriptMessage[] {
    try {
        const lines = content.trim().split('\n');
        return lines
            .filter(line => line.trim() !== '')
            .map(line => JSON.parse(line.trim()) as TranscriptMessage);
    } catch (error) {
        console.error('Error parsing transcript content:', error);
        throw new Error('Failed to parse transcript content');
    }
}

function cleanAndParseJSON(text: string): EmotionAnalysis[] {
    try {
        let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const match = jsonText.match(/\[\s*{[\s\S]*}\s*\]/);
        if (!match) {
            throw new Error('No JSON array found in response');
        }

        jsonText = match[0];
        jsonText = jsonText.replace(/}\s*[^{\s,\]]+\s*{/g, '}, {');
        jsonText = jsonText.replace(/}[^}\],]*\]/g, '}]');

        return JSON.parse(jsonText) as EmotionAnalysis[];
    } catch (error) {
        console.error('Error cleaning and parsing JSON:', error);
        throw new Error('Failed to parse emotion data');
    }
}

export async function POST(request: NextRequest) {
    try {
        const { content, contentType, meetingId, userId } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        let transcriptContent: string;
        if (typeof content === 'string' && (content.startsWith('http://') || content.startsWith('https://'))) {
            transcriptContent = await fetchTranscriptContent(content);
        } else {
            transcriptContent = content;
        }

        const messages = parseTranscriptContent(transcriptContent);
        const userMessages = userId 
            ? messages.filter(msg => msg.speaker_id === userId)
            : messages;

        if (userMessages.length === 0) {
            return NextResponse.json(
                { error: 'No messages found for the specified user' },
                { status: 400 }
            );
        }

        // Initialize the model
        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

        // Create prompt with both text and timestamp
        const prompt = `Analyze the emotions in these messages from user ${userId}.

Here are the messages:
${userMessages.map(msg => `"${msg.text}" [${msg.start_ts}]`).join('\n')}

Return ONLY a JSON array with this exact structure for each message (no additional text):
[
  {
    "message": "exact message text",
    "emotion": "emotion (Happy/Sad/Frustrated/Anxious/Excited/Neutral/Confused/Angry)",
    "confidence": "High/Medium/Low",
    "timestamp": number,
    "speaker_id": "${userId}",
    "text": "exact message text"
  }
]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const emotions = cleanAndParseJSON(text);

        // Ensure each emotion analysis has both timestamp and text
        const validatedEmotions = userMessages.map((msg, index) => ({
            ...emotions[index],
            message: msg.text,
            timestamp: msg.start_ts,
            text: msg.text // Ensure the text field is included
        }));

        return NextResponse.json({
            emotions: validatedEmotions,
            meetingId,
            contentType,
            speaker_id: userId
        });

    } catch (error) {
        console.error('Error analyzing emotions:', error);
        return NextResponse.json(
            { 
                error: 'Failed to analyze emotions', 
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
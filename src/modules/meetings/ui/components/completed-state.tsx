import Link from "next/link";
import Markdown from "react-markdown";
import { useState } from "react";
import { format } from "date-fns";
import jsPDF from "jspdf";

import { MeetingGetOne } from "../../types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    BookOpenTextIcon,
    SparkleIcon,
    FileTextIcon,
    FileVideoIcon,
    ClockFadingIcon,
    SmileIcon,
    DownloadIcon,
} from "lucide-react";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { formatDuration, slugify } from "@/lib/utils";
import { ChatProvider } from "./chat-provider";
import { Transcript, TranscriptEntry } from "./transcript";

interface Props {
    data: MeetingGetOne;
}

interface EmotionData {
    message: string;
    emotion: string;
    confidence: string;
    timestamp: number;
    text: string;
    speaker_id: string;
}

export const CompletedState = ({ data }: Props) => {
    const [emotions, setEmotions] = useState<EmotionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcriptData, setTranscriptData] = useState<TranscriptEntry[]>([]);

    // --- Download Functions ---
    const downloadAsTxt = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadAsPdf = (content: string, filename: string) => {
        const doc = new jsPDF();
        const lines = doc.splitTextToSize(content, 180); // A4 width in mm, with margins
        doc.text(lines, 10, 10);
        doc.save(`${filename}.pdf`);
    };

    const formatTranscriptForDownload = (transcript: TranscriptEntry[]): string => {
        return transcript.map(entry => {
            const timestamp = format(new Date(0, 0, 0, 0, 0, Math.round(entry.start_ts / 1000)), "mm:ss");
            const userName = entry.user.name ?? 'Unknown User';
            return `[${timestamp}] ${userName}: ${entry.text}`;
        }).join('\n\n');
    };
    // --- End Download Functions ---

    const analyzeEmotions = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const summaryText = (data.transcriptUrl ?? "").toString().trim();

            if (!summaryText) {
                throw new Error('No summary available to analyze');
            }

            const response = await fetch('/api/analyze-emotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: summaryText,
                    contentType: 'summary',
                    meetingId: data.id,
                    userId: data.userId,
                }),
            });

            if (!response.ok) {
                let serverMsg = 'Failed to analyze emotions';
                try {
                    const errBody = await response.json();
                    if (errBody && errBody.message) serverMsg = String(errBody.message);
                } catch (e) { /* ignore */ }
                throw new Error(serverMsg);
            }

            const result = await response.json();
            setEmotions(result.emotions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getEmotionColor = (emotion: string) => {
        const emotionLower = emotion.toLowerCase();
        if (emotionLower.includes('happy') || emotionLower.includes('joy')) return 'bg-green-100 text-green-800';
        if (emotionLower.includes('sad') || emotionLower.includes('disappointed')) return 'bg-blue-100 text-blue-800';
        if (emotionLower.includes('angry') || emotionLower.includes('frustrated')) return 'bg-red-100 text-red-800';
        if (emotionLower.includes('anxious') || emotionLower.includes('worried')) return 'bg-orange-100 text-orange-800';
        if (emotionLower.includes('neutral') || emotionLower.includes('calm')) return 'bg-gray-100 text-gray-800';
        if (emotionLower.includes('excited') || emotionLower.includes('enthusiastic')) return 'bg-purple-100 text-purple-800';
        if (emotionLower.includes('confused')) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="flex flex-col gap-y-4">
            <Tabs defaultValue="summary">
                <div className="bg-white rounded-lg border px-3">
                    <ScrollArea>
                        <TabsList className="p-0 bg-background justify-start rounded-none h-13">
                            <TabsTrigger value="summary" className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"><BookOpenTextIcon />Summary</TabsTrigger>
                            <TabsTrigger value="transcript" className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"><FileTextIcon />Transcript</TabsTrigger>
                            <TabsTrigger value="recording" className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"><FileVideoIcon />Recording</TabsTrigger>
                            <TabsTrigger value="emotions" className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"><SmileIcon />Emotion Detection</TabsTrigger>
                            <TabsTrigger value="chat" className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"><SparkleIcon />Ask AI</TabsTrigger>
                        </TabsList>
                        <ScrollBar orientation="horizontal"/>
                    </ScrollArea>
                </div>

                <TabsContent value="chat">
                    <ChatProvider meetingId={data.id} meetingName={data.name}/>
                </TabsContent>

                <TabsContent value="transcript">
                    <Transcript 
                        meetingId={data.id}
                        onDataLoaded={setTranscriptData}
                        actions={
                            <div className="flex items-center gap-x-2">
                                <button onClick={() => downloadAsTxt(formatTranscriptForDownload(transcriptData), `${slugify(data.name)}-transcript`)} className="flex items-center gap-x-1 text-sm text-muted-foreground hover:text-primary">
                                    <DownloadIcon className="size-4" /> TXT
                                </button>
                                <button onClick={() => downloadAsPdf(formatTranscriptForDownload(transcriptData), `${slugify(data.name)}-transcript`)} className="flex items-center gap-x-1 text-sm text-muted-foreground hover:text-primary">
                                    <DownloadIcon className="size-4" /> PDF
                                </button>
                            </div>
                        }
                    />
                </TabsContent>

                <TabsContent value="recording">
                    <div className="bg-white rounded-lg border px-4 py-5">
                        <video src={data.recordingUrl!} className="w-full rounded-lg" controls />
                    </div>
                </TabsContent>

                <TabsContent value="summary">
                    <div className="bg-white rounded-lg border">
                        <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
                            <div className="flex items-start justify-between">
                                <h2 className="text-2xl font-medium capitalize">{data.name}</h2>
                                <div className="flex items-center gap-x-4">
                                    <button onClick={() => downloadAsTxt(data.summary ?? '', `${slugify(data.name)}-summary`)} className="flex items-center gap-x-1 text-sm text-muted-foreground hover:text-primary">
                                        <DownloadIcon className="size-4" /> TXT
                                    </button>
                                    <button onClick={() => downloadAsPdf(data.summary ?? '', `${slugify(data.name)}-summary`)} className="flex items-center gap-x-1 text-sm text-muted-foreground hover:text-primary">
                                        <DownloadIcon className="size-4" /> PDF
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-x-2 items-center">
                                <Link href={`/agents/${data.agent.id}`} className="flex items-center gap-x-2 underline underline-offset-4 capitalize">
                                    <GeneratedAvatar variant="botttsNeutral" seed={data.agent.name} className="size-5" />
                                    {data.agent.name}
                                </Link>
                                <p>{data.startedAt ? format(data.startedAt, "PPP") : ""}</p>
                            </div>
                            <div className="flex gap-x-2 items-center">
                                <SparkleIcon className="size-4"/>
                                <p>General summary</p>
                            </div>
                            <Badge variant="outline" className="flex items-center gap-x-2 [&>svg]:size-4 w-fit">
                                <ClockFadingIcon className="text-blue-700" />
                                {data.duration ? formatDuration(data.duration) : "No duration"}
                            </Badge>
                            <div>
                                <Markdown
                                    components={{
                                        h1: (props) => <h1 className="text-2xl font-medium mb-6" {...props} />,
                                        h2: (props) => <h2 className="text-xl font-medium mb-6" {...props} />,
                                        h3: (props) => <h3 className="text-lg font-medium mb-6" {...props} />,
                                        p: (props) => <p className="mb-6 leading-relaxed" {...props}/>,
                                        ul: (props) => <ul className="list-disc list-inside mb-6" {...props} />,
                                        li: (props) => <li className="mb-1" {...props} />,
                                    }}
                                >
                                    {data.summary}
                                </Markdown>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="emotions">
                    <div className="bg-white rounded-lg border px-4 py-5">
                        <div className="flex flex-col gap-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-medium">Emotion Detection</h2>
                                    <p className="text-sm text-muted-foreground mt-1">AI-powered analysis of user emotions from transcript</p>
                                </div>
                                {emotions.length === 0 && (
                                    <button 
                                        onClick={analyzeEmotions} 
                                        disabled={loading} 
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Analyzing...' : 'Analyze Emotions'}
                                    </button>
                                )}
                            </div>

                            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
                            {loading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                </div>
                            )}
                            {emotions.length > 0 && (
                                <div className="space-y-4 mt-4">
                                    {emotions.map((item, index) => (
                                        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 mb-2">{item.text}</p>
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        {format(new Date(0, 0, 0, 0, 0, Math.round(item.timestamp / 1000)), "mm:ss")}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge className={`${getEmotionColor(item.emotion)} border-0`}>
                                                        {item.emotion}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">{item.confidence}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!loading && emotions.length === 0 && !error && (
                                <div className="text-center py-12 text-gray-500">
                                    <SmileIcon className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                                    <p>Click "Analyze Emotions" to detect emotions from the transcript</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
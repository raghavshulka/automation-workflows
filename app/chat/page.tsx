'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useState } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import Markdown from 'react-markdown';
import Image from 'next/image';

async function convertFilesToDataURLs(
    files: FileList,
): Promise<
    { type: 'file'; filename: string; mediaType: string; url: string }[]
> {
    return Promise.all(
        Array.from(files).map(
            file =>
                new Promise<{
                    type: 'file';
                    filename: string;
                    mediaType: string;
                    url: string;
                }>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve({
                            type: 'file',
                            filename: file.name,
                            mediaType: file.type,
                            url: reader.result as string,
                        });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                }),
        ),
    );
}

export default function Chat() {
    const [input, setInput] = useState('');

    const { messages, sendMessage } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/tool',
        }),
    });

    const [files, setFiles] = useState<FileList | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (event: React.FormEvent | React.MouseEvent) => {
        event.preventDefault();

        if (!input.trim() && (!files || files.length === 0)) return;

        const fileParts =
            files && files.length > 0
                ? await convertFilesToDataURLs(files)
                : [];

        sendMessage({
            role: 'user',
            parts: [{ type: 'text', text: input }, ...fileParts],
        });

        setFiles(undefined);
        setInput('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        if (files) {
            const dt = new DataTransfer();
            Array.from(files).forEach((file, i) => {
                if (i !== index) dt.items.add(file);
            });
            setFiles(dt.files.length > 0 ? dt.files : undefined);
            if (fileInputRef.current) {
                fileInputRef.current.files = dt.files;
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-gray-900/10 to-black"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Header with Glassmorphism */}
            <div className="relative z-10 flex-shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-xl backdrop-saturate-150">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
                <div className="relative container mx-auto px-6 py-6">
                    <h1 className="text-2xl text-center font-bold text-white/90 tracking-wide">
                        RAG/Chat/toolcalling
                    </h1>
                    <p className="text-sm text-center text-white/70 mt-1">
                        chat with gemini pro
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="relative z-10 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="container mx-auto px-6 py-8 max-w-5xl">
                        <div className="space-y-6">
                            {messages.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 via-gray-500/20 to-gray-500/20 rounded-2xl blur-xl"></div>
                                        <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-12">
                                            <div className="text-white/90 text-2xl font-semibold mb-4">welcome</div>
                                            <div className="text-white/60 text-base">RAG/Chat/toolcalling
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                messages.map(message => (
                                    <div key={message.id} className="space-y-3">
                                        <div className={`relative ${message.role === 'user'
                                            ? 'ml-auto max-w-[85%]'
                                            : 'mr-auto max-w-[85%]'
                                            }`}>
                                            <div className={`absolute -inset-1 rounded-2xl blur-sm ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-gray-800/20 to-gray-500/20'
                                                : 'bg-gradient-to-r from-gray-800/20 to-gray-500/20'
                                                }`}></div>

                                            <Card className={`relative border-0 shadow-2xl ${message.role === 'user'
                                                ? 'bg-black/40 backdrop-blur-xl'
                                                : 'bg-black/30 backdrop-blur-xl'
                                                }`}>
                                                <div className={`absolute inset-0 rounded-xl border ${message.role === 'user'
                                                    ? 'border-white/20 bg-gradient-to-br from-white/10 via-transparent to-white/5'
                                                    : 'border-white/15 bg-gradient-to-br from-white/8 via-transparent to-white/3'
                                                    }`}></div>

                                                <CardContent className="relative p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm border ${message.role === 'user'
                                                            ? 'bg-gradient-to-br from-purple-500/30 to-gray-500/30 border-white/20 '
                                                            : 'bg-gradient-to-br from-gray-500/30 to-gray-500/30 border-white/20 '
                                                            }`}>
                                                            {message.role === 'user' ? 'U' : 'AI'}
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            {message.parts.map((part: any, i) => {
                                                                if (part.type == 'text')
                                                                    return <div
                                                                        className="text-gray-300 leading-relaxed prose-headings:text-white/90 "
                                                                        key={`${message.id}-text`}>
                                                                        <Markdown >
                                                                            {part.text}
                                                                        </Markdown>
                                                                    </div>;
                                                                else if (part.type.includes('tool'))
                                                                    return (
                                                                        <div
                                                                            className="text-gray-300 leading-relaxed prose-headings:text-white/90 "
                                                                            key={`${message.id}-weather-${i}`}>
                                                                            <p>
                                                                                <strong>Tool Calling</strong> : {part?.type}
                                                                            </p>

                                                                            <p>{(part?.output)}</p>
                                                                        </div>
                                                                    );
                                                                else if (part.type == 'generate_image') {
                                                                    const { input, output , toolCallId } = part;

                                                                    return (
                                                                        <Image
                                                                            key={toolCallId}
                                                                            src={`data:image/png;base64,${output.image}`}
                                                                            alt={input.prompt}
                                                                            height={400}
                                                                            width={400}
                                                                        />
                                                                    );
                                                                }

                                                            })}
                                                            else return null
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <Breadcrumb />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area with Glassmorphism */}
            <div className="relative z-10 flex-shrink-0 border-t border-white/10 bg-black/20 backdrop-blur-xl backdrop-saturate-150">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
                <div className="relative container mx-auto px-6 py-6 max-w-5xl">
                    {/* File Preview with Glass Effect */}
                    {files && files.length > 0 && (
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-3">
                                {Array.from(files).map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="relative group"
                                    >
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-gray-500/30 rounded-lg blur-sm"></div>
                                        <div className="relative flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-lg px-4 py-3">
                                            <Paperclip className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-white/80 truncate max-w-[200px] font-medium">
                                                {file.name}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 hover:bg-white/10 text-white/60 hover:text-white/90 transition-all duration-200"
                                                onClick={() => removeFile(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <input
                            type="file"
                            onChange={event => {
                                if (event.target.files) {
                                    setFiles(event.target.files);
                                }
                            }}
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                        />

                        {/* File Upload Button */}
                        <div className="relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-gray-500/30 rounded-xl blur-sm opacity-75"></div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="relative flex-shrink-0 bg-black/40 backdrop-blur-xl border-white/20 hover:bg-black/60 text-white/80 hover:text-white transition-all duration-300 h-12 w-12"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Input Field with Glass Effect */}
                        <div className="flex-1 relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500/30 via-gray-500/30 to-purple-500/30 rounded-xl blur-sm"></div>
                            <div className="relative">
                                <Input
                                    value={input}
                                    onChange={event => setInput(event.target.value)}
                                    placeholder="Type your message..."
                                    className="h-12 pr-14 bg-black/40 backdrop-blur-xl border-white/20 text-white placeholder:text-white/50 focus:border-gray-400/50 focus:ring-gray-400/30 transition-all duration-300"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />

                                {/* Send Button */}
                                <div className="absolute right-1 top-1">
                                    <div className="relative">
                                        <div className={`absolute -inset-0.5 rounded-lg blur-sm transition-all duration-300 ${!input.trim() && (!files || files.length === 0)
                                            ? 'bg-gradient-to-r from-gray-500/20 to-gray-400/20'
                                            : 'bg-gradient-to-r from-gray-500/40 to-gray-500/40'
                                            }`}></div>
                                        <Button
                                            onClick={handleSubmit}
                                            size="icon"
                                            disabled={!input.trim() && (!files || files.length === 0)}
                                            className={`relative h-10 w-10 backdrop-blur-xl border transition-all duration-300 ${!input.trim() && (!files || files.length === 0)
                                                ? 'bg-black/40 border-white/10 text-white/40 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-gray-500/30 to-gray-500/30 border-white/20 text-white hover:from-gray-500/40 hover:to-gray-500/40 shadow-lg'
                                                }`}
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
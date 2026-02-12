import { useState, useRef, useCallback } from 'react';
import { Upload, X, Video, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { teacherLectureService } from '../../../../../data/api/teacherLectureService';

interface VideoUploaderProps {
    onUploadComplete: (videoPath: string, videoUrl: string) => void;
    onError?: (message: string) => void;
    existingVideoUrl?: string;
    disabled?: boolean;
}

type UploadStatus = 'idle' | 'uploading' | 'complete' | 'error';

export function TeacherVideoUploader({
    onUploadComplete,
    onError,
    existingVideoUrl,
    disabled = false
}: VideoUploaderProps) {
    const [status, setStatus] = useState<UploadStatus>(existingVideoUrl ? 'complete' : 'idle');
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(existingVideoUrl || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const ALLOWED_TYPES = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/webm'];
    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

    const validateFile = useCallback((file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'صيغة الملف غير مدعومة. الصيغ المدعومة: MP4, AVI, MOV, MKV, WebM';
        }
        if (file.size > MAX_SIZE) {
            return 'حجم الملف يتجاوز 2 جيجابايت';
        }
        return null;
    }, []);

    const handleFileSelect = useCallback((file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setErrorMessage(validationError);
            setStatus('error');
            onError?.(validationError);
            return;
        }

        setSelectedFile(file);
        setErrorMessage('');
        setStatus('idle');
        setVideoUrl(URL.createObjectURL(file));
    }, [validateFile, onError]);

    const startUpload = useCallback(async () => {
        if (!selectedFile) return;

        setStatus('uploading');
        setProgress(0);
        abortControllerRef.current = new AbortController();

        try {
            const result = await teacherLectureService.uploadVideo(
                selectedFile,
                (prog: number, msg: string) => {
                    setProgress(prog);
                    setStatusMessage(msg);
                }
            );

            setStatus('complete');
            setStatusMessage('تم رفع الفيديو بنجاح');
            setVideoUrl(result.videoUrl);
            onUploadComplete(result.videoPath, result.videoUrl);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'فشل رفع الفيديو';
            setStatus('error');
            setErrorMessage(message);
            onError?.(message);
        }
    }, [selectedFile, onUploadComplete, onError]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleRemove = useCallback(() => {
        setSelectedFile(null);
        setVideoUrl(null);
        setStatus('idle');
        setProgress(0);
        setErrorMessage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    return (
        <div className="space-y-4">
            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleInputChange}
                className="hidden"
                disabled={disabled || status === 'uploading'}
            />

            {status === 'idle' && !selectedFile && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                        w-full h-40 rounded-xl border-2 border-dashed transition-all cursor-pointer
                        flex flex-col items-center justify-center gap-3
                        ${isDragging
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-300 dark:border-white/20 bg-slate-50/50 dark:bg-white/5 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-white/10'}`}>
                        <Upload size={28} className={isDragging ? 'text-blue-500' : 'text-slate-400 dark:text-gray-400'} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-600 dark:text-gray-300">اسحب الفيديو هنا أو انقر للاختيار</p>
                        <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">MP4, AVI, MOV, MKV, WebM (الحد الأقصى 2GB)</p>
                    </div>
                </div>
            )}

            {selectedFile && status !== 'complete' && (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-white/5 p-4">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                            <Video size={28} className="text-slate-400 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-charcoal dark:text-white truncate">{selectedFile.name}</p>
                            <p className="text-sm text-slate-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>

                            {status === 'uploading' && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-slate-500 dark:text-gray-400">{statusMessage}</span>
                                        <span className="font-medium text-blue-600">{progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle size={14} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}
                        </div>

                        {status !== 'uploading' && (
                            <button
                                onClick={handleRemove}
                                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {status === 'idle' && (
                        <button
                            onClick={startUpload}
                            disabled={disabled}
                            className="mt-4 w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <Upload size={18} />
                            بدء الرفع
                        </button>
                    )}

                    {status === 'uploading' && (
                        <button
                            disabled
                            className="mt-4 w-full h-11 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/50 font-medium flex items-center justify-center gap-2"
                        >
                            <Loader2 size={18} className="animate-spin" />
                            جاري الرفع...
                        </button>
                    )}
                </div>
            )}

            {status === 'complete' && videoUrl && (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-green-200 dark:border-green-800/30 overflow-hidden">
                    <div className="bg-green-50 dark:bg-green-900/10 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle2 size={16} />
                            <span className="text-sm font-medium">تم رفع الفيديو بنجاح</span>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="text-xs text-slate-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            تغيير الفيديو
                        </button>
                    </div>
                    <div className="p-4">
                        <video
                            src={videoUrl}
                            controls
                            className="w-full rounded-lg max-h-64 bg-black"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}


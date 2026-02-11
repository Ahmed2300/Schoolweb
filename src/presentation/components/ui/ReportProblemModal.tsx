
import { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store';
import { clientReportingService } from '../../../data/api';
import toast from 'react-hot-toast';

interface ReportProblemModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReportProblemModal({ isOpen, onClose }: ReportProblemModalProps) {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setDescription('');
            setGuestName('');
            setGuestEmail('');
            setImages([]);
            setImagePreviews([]);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const validFiles = files.filter(file => {
                if (file.size > 2 * 1024 * 1024) {
                    toast.error(`حجم الملف ${file.name} يتجاوز 2 ميجابايت`);
                    return false;
                }
                return true;
            });

            if (images.length + validFiles.length > 5) {
                toast.error('لا يمكن رفع أكثر من 5 صور');
                return;
            }

            setImages(prev => [...prev, ...validFiles]);

            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            toast.error('يرجى كتابة وصف للمشكلة');
            return;
        }

        if (!user && (!guestName.trim() || !guestEmail.trim())) {
            toast.error('يرجى إدخال الاسم والبريد الإلكتروني');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('جاري إرسال البلاغ...');

        try {
            const formData = new FormData();
            formData.append('text_content', description);

            images.forEach((image) => {
                formData.append('images[]', image);
            });

            if (!user) {
                formData.append('guest_name', guestName);
                formData.append('guest_email', guestEmail);
            }

            await clientReportingService.submitReport(formData);

            toast.success('تم إرسال البلاغ بنجاح، شكراً لملاحظاتك', { id: toastId });
            onClose();
        } catch (error) {
            console.error('Failed to submit report:', error);
            toast.error('حدث خطأ أثناء إرسال البلاغ، يرجى المحاولة لاحقاً', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="الإبلاغ عن مشكلة"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                    <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-blue-700">
                        نقدر ملاحظاتك! سيتم مراجعة تقريرك من قبل فريق الدعم الفني لدينا للعمل على حله في أقرب وقت.
                    </p>
                </div>

                {!user && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">الاسم</label>
                            <input
                                type="text"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all"
                                placeholder="اسمك الكريم"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all"
                                placeholder="example@email.com"
                                dir="ltr"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">وصف المشكلة <span className="text-red-500">*</span></label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-32 p-3 rounded-lg border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all resize-none"
                        placeholder="اشرح المشكلة التي واجهتها بالتفصيل..."
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">صور توضيحية (اختياري - حد أقصى 5)</label>

                    <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group aspect-square">
                                <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur rounded-full shadow-sm text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        {imagePreviews.length < 5 && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-shibl-crimson hover:bg-slate-50 transition-all group aspect-square"
                            >
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mb-1 group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <Upload size={16} className="text-slate-400 group-hover:text-shibl-crimson transition-colors" />
                                </div>
                                <span className="text-xs text-slate-500 font-medium text-center px-1">رفع صور</span>
                            </div>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isLoading}
                    />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 px-5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                        disabled={isLoading}
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-10 px-6 rounded-lg bg-shibl-crimson text-white font-bold hover:bg-shibl-crimson-dark transition-colors shadow-lg shadow-shibl-crimson/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>إرسال البلاغ</span>
                                <CheckCircle2 size={18} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

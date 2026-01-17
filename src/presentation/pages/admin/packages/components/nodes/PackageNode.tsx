import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Crown, Percent, ChevronDown, ChevronUp, Tag, ImagePlus, X } from 'lucide-react';
import { PackageNodeData } from '../../types';

// Shared handle styles
const handleStyle = {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    background: '#f59e0b',
};

export const PackageNode = memo(({ data, selected }: NodeProps<any>) => {
    // Local state for editing to avoid excessive re-renders
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const [showDiscountPanel, setShowDiscountPanel] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cover image state
    const [coverImage, setCoverImage] = useState<string | null>(data.coverImage || null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

    // Discount fields local state
    const [isDiscountActive, setIsDiscountActive] = useState(data.isDiscountActive || false);
    const [discountPercentage, setDiscountPercentage] = useState<number | ''>(data.discountPercentage || '');

    useEffect(() => {
        setLabel(data.label);
        setIsDiscountActive(data.isDiscountActive || false);
        setDiscountPercentage(data.discountPercentage || '');
        setCoverImage(data.coverImage || null);
    }, [data.label, data.isDiscountActive, data.discountPercentage, data.coverImage]);

    const onLabelChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(evt.target.value);
    }, []);

    const onLabelBlur = useCallback(() => {
        setIsEditing(false);
        data.label = label;
    }, [label, data]);

    const onKeyDown = useCallback((evt: React.KeyboardEvent) => {
        if (evt.key === 'Enter') {
            onLabelBlur();
        }
    }, [onLabelBlur]);

    // Image upload handler
    const handleImageUpload = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        const file = evt.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                return;
            }
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                return;
            }

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setCoverImage(previewUrl);
            setCoverImageFile(file);

            // Store in data for save
            data.coverImage = previewUrl;
            data.coverImageFile = file;
        }
    }, [data]);

    const handleRemoveImage = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setCoverImage(null);
        setCoverImageFile(null);
        data.coverImage = null;
        data.coverImageFile = null;
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [data]);

    // Discount handlers
    const handleDiscountToggle = useCallback(() => {
        const newValue = !isDiscountActive;
        setIsDiscountActive(newValue);
        data.isDiscountActive = newValue;

        // Calculate final price when discount is toggled
        if (newValue && discountPercentage) {
            const discount = (data.totalPrice * Number(discountPercentage)) / 100;
            data.finalPrice = data.totalPrice - discount;
            data.discountAmount = discount;
        } else {
            data.finalPrice = data.totalPrice;
            data.discountAmount = 0;
        }
    }, [isDiscountActive, discountPercentage, data]);

    const handlePercentageChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        const value = evt.target.value;
        if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
            setDiscountPercentage(value === '' ? '' : Number(value));
        }
    }, []);

    const handlePercentageBlur = useCallback(() => {
        const numValue = Number(discountPercentage) || 0;
        data.discountPercentage = numValue;

        // Recalculate final price
        if (isDiscountActive && numValue > 0) {
            const discount = (data.totalPrice * numValue) / 100;
            data.finalPrice = data.totalPrice - discount;
            data.discountAmount = discount;
        } else {
            data.finalPrice = data.totalPrice;
            data.discountAmount = 0;
        }
    }, [discountPercentage, isDiscountActive, data]);

    const hasDiscount = isDiscountActive && discountPercentage;
    const calculatedFinalPrice = hasDiscount
        ? data.totalPrice - (data.totalPrice * Number(discountPercentage) / 100)
        : data.totalPrice;
    const displayPrice = hasDiscount ? calculatedFinalPrice : data.totalPrice;

    return (
        <div className={`
            min-w-[240px] rounded-2xl p-4 relative
            bg-gradient-to-br from-amber-100 to-amber-50 
            border-2 ${selected ? 'border-amber-500 shadow-lg shadow-amber-500/30' : 'border-amber-300'}
            transition-all duration-200
        `}>
            {/* Discount Badge */}
            {hasDiscount && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md animate-pulse">
                    <Percent size={10} />
                    {discountPercentage}%
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />

            {/* Target handles on all sides */}
            <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
            <Handle type="target" position={Position.Bottom} id="bottom" style={handleStyle} />
            <Handle type="target" position={Position.Left} id="left" style={handleStyle} />
            <Handle type="target" position={Position.Right} id="right" style={handleStyle} />

            <div className="flex items-center gap-3 mb-3">
                {/* Cover Image / Icon */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        w-12 h-12 rounded-xl flex items-center justify-center shadow-md cursor-pointer
                        transition-all duration-200 hover:scale-105 relative group
                        ${coverImage ? 'bg-transparent' : 'bg-amber-500'}
                    `}
                    title="انقر لإضافة صورة الغلاف"
                >
                    {coverImage ? (
                        <>
                            <img
                                src={coverImage}
                                alt="Cover"
                                className="w-full h-full object-cover rounded-xl"
                            />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                            >
                                <X size={12} />
                            </button>
                        </>
                    ) : (
                        <div className="relative">
                            <Crown size={24} className="text-white" />
                            <ImagePlus size={10} className="text-white absolute -bottom-1 -right-1" />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    {isEditing ? (
                        <input
                            autoFocus
                            value={label}
                            onChange={onLabelChange}
                            onBlur={onLabelBlur}
                            onKeyDown={onKeyDown}
                            className="w-full bg-white/50 border border-amber-300 rounded px-1 py-0.5 text-sm font-bold text-amber-900 focus:outline-none focus:border-amber-500"
                        />
                    ) : (
                        <h3
                            onDoubleClick={() => setIsEditing(true)}
                            className="font-bold text-amber-900 cursor-text hover:bg-amber-100/50 rounded px-1 -ml-1 transition-colors"
                            title="Double click to edit"
                        >
                            {label}
                        </h3>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                        {hasDiscount && (
                            <span className="text-sm text-amber-500 line-through mr-1">
                                {data.totalPrice?.toLocaleString() || 0}
                            </span>
                        )}
                        <span className={`text-lg font-bold ${hasDiscount ? 'text-red-600' : 'text-amber-700'}`}>
                            {displayPrice?.toLocaleString() || 0}
                        </span>
                        <span className="text-xs text-amber-600 font-medium">ر.ع</span>
                    </div>
                </div>
            </div>

            <div className="mt-2 pt-2 border-t border-amber-200 flex items-center justify-between text-xs font-medium">
                <span className="text-amber-800 bg-amber-200/50 px-2 py-1 rounded-full">
                    {data.coursesCount || 0} كورسات
                </span>
                {hasDiscount ? (
                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        وفر {(data.totalPrice * Number(discountPercentage) / 100).toLocaleString()}
                    </span>
                ) : (
                    <span className="text-[10px] text-amber-500 uppercase tracking-wider">Total</span>
                )}
            </div>

            {/* Discount Settings Toggle Button */}
            <button
                onClick={() => setShowDiscountPanel(!showDiscountPanel)}
                className={`
                    w-full mt-3 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2
                    transition-all duration-200
                    ${showDiscountPanel
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-200/50 text-amber-700 hover:bg-amber-200 border border-transparent'}
                `}
            >
                <Tag size={14} />
                إعدادات الخصم
                {showDiscountPanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Discount Settings Panel */}
            {showDiscountPanel && (
                <div className="mt-3 p-3 bg-white/70 rounded-xl border border-amber-200 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {/* Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-800 font-medium">تفعيل الخصم</span>
                        <button
                            onClick={handleDiscountToggle}
                            className={`
                                w-10 h-5 rounded-full transition-all duration-200 relative
                                ${isDiscountActive ? 'bg-green-500' : 'bg-gray-300'}
                            `}
                        >
                            <div className={`
                                w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow
                                ${isDiscountActive ? 'right-0.5' : 'left-0.5'}
                            `} />
                        </button>
                    </div>

                    {/* Percentage Input */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-amber-800 font-medium flex-1">نسبة الخصم %</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={discountPercentage}
                                onChange={handlePercentageChange}
                                onBlur={handlePercentageBlur}
                                disabled={!isDiscountActive}
                                className={`
                                    w-20 px-2 py-1 text-sm rounded-lg border text-center
                                    ${isDiscountActive
                                        ? 'bg-white border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}
                                    focus:outline-none transition-colors
                                `}
                                placeholder="0"
                            />
                            <Percent size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400" />
                        </div>
                    </div>

                    {/* Preview */}
                    {isDiscountActive && discountPercentage && (
                        <div className="pt-2 border-t border-amber-100 text-xs text-center">
                            <span className="text-amber-600">السعر بعد الخصم: </span>
                            <span className="text-red-600 font-bold">
                                {calculatedFinalPrice.toLocaleString()} ر.ع
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});



import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, TrashIcon } from './Icons';

interface BannerProps {
    imageUrl?: string;
    onImageUpload: (dataUrl: string) => void;
    onRemoveImage: () => void;
    isEditable: boolean;
    altText?: string;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const Banner: React.FC<BannerProps> = ({ imageUrl, onImageUpload, onRemoveImage, isEditable, altText = "Banner Image" }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const editMenuRef = useRef<HTMLDivElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const dataUrl = await fileToDataUrl(file);
                onImageUpload(dataUrl);
                setIsEditing(false);
            } catch (error) {
                console.error("Error reading file:", error);
                alert("Could not load image file.");
            }
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        onRemoveImage();
        setIsEditing(false);
    };
    
    useEffect(() => {
        if (!isEditing) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (editMenuRef.current && !editMenuRef.current.contains(event.target as Node)) {
                setIsEditing(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing]);

    return (
        <div className={`relative w-full overflow-hidden transition-all duration-300 ${imageUrl ? 'h-32 bg-white dark:bg-slate-700' : 'h-8'}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
            />
            {imageUrl ? (
                <>
                    <img 
                        src={imageUrl} 
                        alt={altText}
                        className="w-full h-full object-cover" 
                        onDoubleClick={() => isEditable && setIsEditing(true)}
                        title={isEditable ? 'برای ویرایش دو بار کلیک کنید' : ''}
                    />
                    {isEditable && isEditing && (
                        <div 
                            className="absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center animate-fade-in"
                        >
                           <div ref={editMenuRef} className="flex items-center justify-center space-x-4 space-x-reverse">
                                <button onClick={(e) => { e.stopPropagation(); triggerFileSelect(); }} className="flex items-center px-3 py-2 text-sm bg-white/90 text-black rounded-md hover:bg-white shadow-lg">
                                    <CameraIcon className="w-4 h-4 ml-1" />
                                    تغییر تصویر
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleRemove(); }} className="flex items-center px-3 py-2 text-sm bg-white/90 text-red-600 rounded-md hover:bg-white shadow-lg">
                                    <TrashIcon className="w-4 h-4 ml-1" />
                                    حذف
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                isEditable && (
                    <div className="absolute top-0 right-2 h-full w-12 group">
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                                onClick={triggerFileSelect} 
                                className="p-2 bg-gray-500/50 backdrop-blur-sm text-white rounded-full hover:bg-gray-600/60"
                                title="افزودن بنر"
                            >
                                <CameraIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

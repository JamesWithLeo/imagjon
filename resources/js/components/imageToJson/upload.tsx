import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import imageCompression from 'browser-image-compression';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useForm } from '@inertiajs/react';
import { ReplaceIcon, Trash, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadTrigger,
} from '@/components/ui/file-upload';
import { ButtonGroup } from '@/components/ui/button-group';
import FieldCreator from './field-creator';
import { FormField } from '@/types';

interface EditableImage {
    id: string;
    file: File;
    previewUrl: string;
    customName: string;
}

export default function UploadDocument() {
    const [images, setImages] = useState<EditableImage[]>([]);
    const [activeReplaceId, setActiveReplaceId] = useState<string | null>(null);
    const [openedFieldCreator, setOpenedFieldCreator] =
        useState<boolean>(false);

    // Single hidden input reference for handling all inline replacements
    const replaceInputRef = useRef<HTMLInputElement>(null);

    const { post, processing, errors } = useForm({
        images: [] as File[],
    });

    const [fields, setFields] = useState<FormField[]>([
        { id: crypto.randomUUID(), name: '', type: 'text' },
    ]);

    const triggerReplace = (id: string) => {
        setActiveReplaceId(id);
        if (replaceInputRef.current) {
            // Reset the value so the onChange fires even if the same file name is chosen
            replaceInputRef.current.value = '';
            replaceInputRef.current.click();
        }
    };
    const handleReplaceFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file || !activeReplaceId) return;

        setImages((prev) =>
            prev.map((item) => {
                if (item.id === activeReplaceId) {
                    URL.revokeObjectURL(item.previewUrl);
                    return {
                        ...item,
                        file: file,
                        previewUrl: URL.createObjectURL(file),
                        customName: file.name.replace(/\.[^/.]+$/, ''),
                    };
                }
                return item;
            }),
        );
        setActiveReplaceId(null);
    };

    const handleValueChange = (incomingFiles: File[]) => {
        // SCENARIO B: Brand new main files appended via Drag & Drop or Browse Trigger
        setImages((prev) => {
            const uniqueFiles = incomingFiles.filter(
                (newFile) =>
                    !prev.some(
                        (existing) =>
                            existing.file.name === newFile.name &&
                            existing.file.size === newFile.size &&
                            existing.file.lastModified === newFile.lastModified,
                    ),
            );

            const newEntries: EditableImage[] = uniqueFiles.map((file) => ({
                id: crypto.randomUUID(),
                file,
                previewUrl: URL.createObjectURL(file),
                customName: file.name.replace(/\.[^/.]+$/, ''),
            }));

            return [...prev, ...newEntries];
        });
    };

    const handleRemove = (id: string) => {
        setImages((prev) => {
            const target = prev.find((img) => img.id === id);
            if (target) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((img) => img.id !== id);
        });
    };

    const handleRename = (id: string, newName: string) => {
        setImages((prev) =>
            prev.map((img) =>
                img.id === id ? { ...img, customName: newName } : img,
            ),
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };
        try {
            const compressedFiles = await Promise.all(
                images.map(async (img) => {
                    return await imageCompression(img.file, options);
                }),
            );

            compressedFiles.forEach((file, index) => {
                const originalFileName = images[index].file.name;
                formData.append(`images[${index}]`, file, originalFileName);
                formData.append(
                    `custom_names[${index}]`,
                    images[index].customName ?? '',
                );
            });

            // Target fields collection to pass down context to Gemini
            const dynamicFields = ['name', 'brand', 'price', 'description'];
            dynamicFields.forEach((field, index) => {
                formData.append(`fields[${index}]`, field);
            });

            const response = await fetch('/imageToJson/upload', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                body: formData,
            });

            const responseData = await response.json();
            console.log('response:', responseData);
        } catch (error) {
            console.error('Error processing files:', error);
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="flex min-h-full w-full max-w-4xl flex-1 flex-col items-center space-y-2 p-6 starting:opacity-0"
            >
                <div className="w-full max-w-xl">
                    <input
                        type="file"
                        ref={replaceInputRef}
                        onChange={handleReplaceFileChange}
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                    />
                    <label className="mb-2 block text-sm font-medium text-nowrap text-gray-700">
                        Upload folder or images (accepts: png, jpg & webp
                        formats)
                    </label>

                    {/* Primary Upload Input Section */}
                    <FileUpload
                        value={images.map((img) => img.file)}
                        onValueChange={handleValueChange}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        multiple
                        className="w-full"
                    >
                        <FileUploadDropzone>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center justify-center rounded-full border p-2.5">
                                    <Upload className="size-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium">
                                    Drag & drop files here
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Or click to browse
                                </p>
                            </div>
                            <FileUploadTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 w-fit"
                                >
                                    Browse files
                                </Button>
                            </FileUploadTrigger>
                        </FileUploadDropzone>
                        {/* <FileUploadList>
                        {images.map((file) => (
                            <FileUploadItem key={file.id} value={file.file}>
                                <FileUploadItemPreview />
                                <FileUploadItemMetadata />
                                <FileUploadItemDelete asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                    >
                                        <X />
                                    </Button>
                                </FileUploadItemDelete>
                            </FileUploadItem>
                        ))}
                    </FileUploadList> */}
                    </FileUpload>
                    {
                        <div className="mt-2 flex justify-between">
                            <h1 className="mb-2 block text-sm font-medium text-nowrap text-muted-foreground">
                                {images.length} image selected
                            </h1>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={'secondary'}
                                    size={'xs'}
                                    onClick={() => {
                                        setOpenedFieldCreator(true);
                                    }}
                                >
                                    Add/Edit fields
                                </Button>
                                <Button
                                    type="button"
                                    variant={'destructive'}
                                    size={'xs'}
                                    onClick={() => setImages([])}
                                >
                                    <Trash />
                                    Remove images
                                </Button>
                            </div>
                        </div>
                    }

                    {errors.images && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.images}
                        </p>
                    )}
                </div>

                {/* Grid Display & Inline Preview Customizations */}
                <div
                    className={`grid w-full ${images.length > 0 && 'mb-4 flex-1'} grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4`}
                >
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className="group relative aspect-square h-50 w-full space-y-2 rounded-lg border p-3"
                        >
                            <ButtonGroup className="absolute top-4 right-4 z-10 flex flex-row justify-end rounded-lg bg-black/50 p-1 backdrop-blur-2xl">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() =>
                                                triggerReplace(img.id)
                                            }
                                            variant="ghost"
                                            size="icon-xs"
                                            type="button"
                                        >
                                            <ReplaceIcon />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        Replace Image
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => handleRemove(img.id)}
                                            variant="ghost"
                                            size="icon-xs"
                                            type="button"
                                        >
                                            <X />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        Remove Image
                                    </TooltipContent>
                                </Tooltip>
                            </ButtonGroup>

                            <img
                                src={img.previewUrl}
                                alt={img.customName}
                                className="h-full w-full rounded object-cover"
                            />

                            {/* Rename Input */}
                            <div className="absolute bottom-3 left-0 w-full px-3 text-sm">
                                <input
                                    type="text"
                                    value={img.customName}
                                    onChange={(e) =>
                                        handleRename(img.id, e.target.value)
                                    }
                                    className="relative bottom-0 left-0 w-full rounded border border-neutral-700 bg-neutral-900/80 p-1 text-sm text-white focus:outline-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    type="submit"
                    className="sticky bottom-6 z-20 cursor-pointer shadow shadow-white"
                    // disabled={processing || images.length === 0}
                >
                    {/* {processing ? <Spinner /> : 'Confirm & Generate Json'} */}
                    Generate Json
                </Button>
            </form>
            <FieldCreator
                open={openedFieldCreator}
                onOpenChange={setOpenedFieldCreator}
                fields={fields}
                setFields={setFields}
            />
        </>
    );
}

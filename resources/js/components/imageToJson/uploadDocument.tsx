import { useForm, usePage } from '@inertiajs/react';
import imageCompression from 'browser-image-compression';
import { AlertCircle, Upload, X } from 'lucide-react';
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadTrigger,
    FileUploadList,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
} from '@/components/ui/file-upload';
import type { EditableImage } from '@/types/ui';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Spinner } from '../ui/spinner';
import FieldCreator from './field-creator';

export default function UploadDocument() {
    const { jsonFieldsAndContext } = usePage().props;
    const { processing, setData, data } = useForm({
        images: [] as EditableImage[],
        context: jsonFieldsAndContext?.context || '',
    });
    const [openedFieldCreator, setOpenedFieldCreator] =
        useState<boolean>(false);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

    // const [activeReplaceId, setActiveReplaceId] = useState<string | null>(null);

    // Single hidden input reference for handling all inline replacements
    // const replaceInputRef = useRef<HTMLInputElement>(null);

    // const triggerReplace = (id: string) => {
    //     setActiveReplaceId(id);

    //     if (replaceInputRef.current) {
    //         // Reset the value so the onChange fires even if the same file name is chosen
    //         replaceInputRef.current.value = '';
    //         replaceInputRef.current.click();
    //     }
    // };

    // const handleReplaceFileChange = (
    //     e: React.ChangeEvent<HTMLInputElement>,
    // ) => {
    //     const file = e.target.files?.[0];

    //     if (!file || !activeReplaceId) {
    //         return;
    //     }

    //     setData((prevData) => {
    //         const updatedImages = prevData.images.map((item) => {
    //             if (item.id === activeReplaceId) {
    //                 URL.revokeObjectURL(item.previewUrl);
    //             }

    //             return {
    //                 ...item,
    //                 file: file,
    //                 previewUrl: URL.createObjectURL(file),
    //                 customName: file.name.replace(/\.[^/.]+$/, ''),
    //             };
    //         });

    //         return {
    //             ...prevData,
    //             images: updatedImages,
    //         };
    //     });
    //     setActiveReplaceId(null);
    // };

    const handleValueChange = async (incomingFiles: File[]) => {
        // SCENARIO B: Brand new main files appended via Drag & Drop or Browse Trigger
        setData((prevData) => {
            // 1. Filter out duplicates based on file properties
            const uniqueFiles = incomingFiles.filter(
                (newFile) =>
                    !prevData.images.some(
                        (existing) =>
                            existing.file.name === newFile.name &&
                            existing.file.size === newFile.size &&
                            existing.file.lastModified === newFile.lastModified,
                    ),
            );

            // 2. Map unique incoming files into your EditableImage model
            const newEntries: EditableImage[] = uniqueFiles.map((file) => ({
                id: crypto.randomUUID(),
                file,
                previewUrl: URL.createObjectURL(file),
                customName: file.name.replace(/\.[^/.]+$/, ''),
            }));

            // 3. Return the updated form state object
            return {
                ...prevData,
                images: [...prevData.images, ...newEntries],
            };
        });

        // setImages((prev) => {
        //     const uniqueFiles = incomingFiles.filter(
        //         (newFile) =>
        //             !prev.some(
        //                 (existing) =>
        //                     existing.file.name === newFile.name &&
        //                     existing.file.size === newFile.size &&
        //                     existing.file.lastModified === newFile.lastModified,
        //             ),
        //     );

        //     const newEntries: EditableImage[] = uniqueFiles.map((file) => ({
        //         id: crypto.randomUUID(),
        //         file,
        //         previewUrl: URL.createObjectURL(file),
        //         customName: file.name.replace(/\.[^/.]+$/, ''),
        //     }));

        //     return [...prev, ...newEntries];
        // });
    };

    const handleRemove = (id: string) => {
        setData((prevData) => {
            const target = prevData.images.find((img) => img.id === id);

            if (target) {
                URL.revokeObjectURL(target.previewUrl);
            }

            // return prevData.filter((img) => img.id !== id);

            return {
                ...prevData,
                images: prevData.images.filter((img) => img.id !== id),
            };
        });
        // setImages((prev) => {
        //     const target = prev.find((img) => img.id === id);

        //     if (target) {
        //         URL.revokeObjectURL(target.previewUrl);
        //     }

        //     return prev.filter((img) => img.id !== id);
        // });
    };

    // const handleRename = (id: string, newName: string) => {
    //     setImages((prev) =>
    //         prev.map((img) =>
    //             img.id === id ? { ...img, customName: newName } : img,
    //         ),
    //     );
    // };

    const submitImages = async () => {
        // const formData = new FormData();
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            const compressedFiles = await Promise.all(
                data.images.map(async (img) => {
                    const compresedFile = await imageCompression(
                        img.file,
                        options,
                    );

                    return { ...img, file: compresedFile };
                }),
            );
            setData((prev) => ({ ...prev, images: compressedFiles }));

            // const schemaFields = Array.isArray(jsonFieldsAndContext?.fields)
            //     ? jsonFieldsAndContext.fields
            //     : [];

            // compressedFiles.forEach((file, index) => {
            //     const originalFileName = images[index].file.name;
            //     formData.append(`images[${index}]`, file, originalFileName);
            //     formData.append(
            //         `custom_names[${index}]`,
            //         images[index].customName ?? '',
            //     );
            // });

            // formData.append('fields', JSON.stringify(schemaFields));
            // formData.append(
            //     'context',
            //     typeof jsonFieldsAndContext?.context === 'string'
            //         ? jsonFieldsAndContext.context
            //         : '',
            // );

            // const response = await fetch('/imageToJson/upload', {
            //     method: 'POST',
            //     headers: {
            //         Accept: 'application/json',
            //         'X-CSRF-TOKEN':
            //             (
            //                 document.querySelector(
            //                     'meta[name="csrf-token"]',
            //                 ) as HTMLMetaElement
            //             )?.content || '',
            //     },
            //     body: formData,
            // });

            // const responseData = await response.json();
            // console.log('response:', responseData);
        } catch (error) {
            console.error('Error processing files:', error);
        } finally {
            console.log('Final data to submit:', data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(jsonFieldsAndContext);
        await submitImages();
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="flex min-h-full w-full max-w-4xl flex-1 grid-cols-1 flex-col items-center space-y-2 px-4 py-8 starting:opacity-0"
            >
                <div className="flex h-full w-full flex-col items-center">
                    <div className="w-full max-w-xl">
                        {/* <input
                            type="file"
                            ref={replaceInputRef}
                            onChange={handleReplaceFileChange}
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                        /> */}
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Upload folder or images (accepts: png, jpg & webp
                            formats)
                        </label>

                        {/* Primary Upload Input Section */}
                        <FileUpload
                            value={data.images.map((img) => img.file)}
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
                                {data.images.length >= 1 && (
                                    <Badge variant={'secondary'} asChild>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // setImages([]);
                                                setData((prev) => ({
                                                    ...prev,
                                                    images: [],
                                                }));
                                            }}
                                        >
                                            {data.images.length} image selected
                                            <X />
                                        </button>
                                    </Badge>
                                )}
                            </FileUploadDropzone>
                            <FileUploadList>
                                {data.images.map((file) => (
                                    <FileUploadItem
                                        key={file.id}
                                        value={file.file}
                                    >
                                        <FileUploadItemPreview />
                                        <FileUploadItemMetadata />

                                        <FileUploadItemDelete asChild>
                                            <Button
                                                onClick={() =>
                                                    handleRemove(file.id)
                                                }
                                                variant="ghost"
                                                size="icon"
                                                className="size-7"
                                            >
                                                <X />
                                            </Button>
                                        </FileUploadItemDelete>
                                    </FileUploadItem>
                                ))}
                            </FileUploadList>
                        </FileUpload>
                        <div className="mt-2 flex w-full flex-col items-end gap-2">
                            {Array.isArray(jsonFieldsAndContext.fields) &&
                                jsonFieldsAndContext.fields.length === 0 && (
                                    <Alert title="Schema Required">
                                        <AlertTitle>Schema Required</AlertTitle>
                                        <AlertCircle />
                                        <AlertDescription>
                                            You haven't defined your dynamic
                                            data structure yet. You must define
                                            at least one schema field before
                                            generating your final metadata
                                            layout.
                                        </AlertDescription>
                                    </Alert>
                                )}
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-6 flex flex-row justify-center gap-2">
                    <Button
                        type="button"
                        variant={'outline'}
                        onClick={() => {
                            setOpenedFieldCreator(true);
                        }}
                        size={'sm'}
                    >
                        Define Fields
                    </Button>
                    <Button
                        type="button"
                        className="cursor-pointer shadow"
                        onClick={() => setConfirmOpen(true)}
                        disabled={
                            processing ||
                            data.images.length === 0 ||
                            jsonFieldsAndContext?.fields.length === 0
                        }
                        size={'sm'}
                    >
                        {processing ? <Spinner /> : ' Generate Json'}
                    </Button>
                </div>
                {/* Grid Display & Inline Preview Customizations */}
                {/* <div
                    className={`grid w-full ${images.length > 0 && 'mb-4 flex-1'} grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4`}
                >
                    
                    {images.map((img) => (
                    ))}
                </div> */}
            </form>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Generate JSON</DialogTitle>
                        <DialogDescription>
                            {data.images.length} image(s) will be processed.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <div className="mt-4 flex flex-col gap-2">
                                <Label>Api key</Label>
                                <Input className="max-w-sm" />
                            </div>
                            <div className="mt-4 flex flex-col gap-px">
                                <Label>Context</Label>
                                <p className="text-muted-foreground">
                                    {jsonFieldsAndContext.context}
                                </p>
                            </div>

                            <Label className="mt-4">Created fields</Label>
                            <div className="flex flex-wrap gap-2">
                                {jsonFieldsAndContext.fields.length > 0 ? (
                                    jsonFieldsAndContext.fields.map(
                                        (f: any) => (
                                            <Badge
                                                key={f.id}
                                                variant="secondary"
                                            >
                                                {f.fieldName}
                                                {f.fieldType && (
                                                    <> ({f.fieldType})</>
                                                )}
                                            </Badge>
                                        ),
                                    )
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        No fields defined
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <div className="flex w-full flex-row-reverse gap-2">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                onClick={async () => {
                                    setConfirmOpen(false);
                                    await submitImages();
                                }}
                                disabled={
                                    processing ||
                                    data.images.length === 0 ||
                                    jsonFieldsAndContext.fields.length === 0
                                }
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    'Confirm & Generate'
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <FieldCreator
                open={openedFieldCreator}
                onOpenChange={setOpenedFieldCreator}
            />
        </>
    );
}

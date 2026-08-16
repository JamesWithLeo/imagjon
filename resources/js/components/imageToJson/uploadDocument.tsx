import { useForm, usePage } from '@inertiajs/react';
import imageCompression from 'browser-image-compression';
import { AlertCircle, EyeOffIcon, Upload, EyeIcon, X } from 'lucide-react';
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
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
import { Field, FieldDescription, FieldLabel } from '../ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '../ui/input-group';
import { Label } from '../ui/label';
import { Spinner } from '../ui/spinner';
import FieldCreator from './field-creator';

export default function UploadDocument() {
    const { jsonFieldsAndContext } = usePage().props;
    const { processing, setData, data, post, transform } = useForm({
        images: [] as EditableImage[],
        context: jsonFieldsAndContext?.context || '',
        apiKey: '',
    });

    const [openedFieldCreator, setOpenedFieldCreator] =
        useState<boolean>(false);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [showApiKey, setShowApiKey] = useState<boolean>(false);

    const handleValueChange = async (incomingFiles: File[]) => {
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
    };

    const handleRemove = (id: string) => {
        setData((prevData) => {
            const target = prevData.images.find((img) => img.id === id);

            if (target) {
                URL.revokeObjectURL(target.previewUrl);
            }

            return {
                ...prevData,
                images: prevData.images.filter((img) => img.id !== id),
            };
        });
    };

    const submitImages = async () => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            // 1. Compress images in parallel
            const compressedEntries = await Promise.all(
                data.images.map(async (img) => {
                    const compressedFile = await imageCompression(
                        img.file,
                        options,
                    );

                    return { ...img, file: compressedFile };
                }),
            );

            transform((data) => ({
                ...data,
                images: compressedEntries,
            }));
            console.log('data:', data);

            return;

            post('/imageToJson/upload', {
                preserveState: true,
                preserveScroll: false,
                forceFormData: true,

                onSuccess: () => {
                    console.log('Images submitted successfully');
                },
                onError: (errors) => {
                    console.error('Inertia validation errors:', errors);
                },
            });
        } catch (error) {
            // Catches failures during the compression phase
            console.error('Error during image compression:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Upload folder or images (accepts: png, jpg & webp
                            formats)
                        </label>

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
                    </div>
                </div>

                <div className="sticky bottom-6 flex max-w-4xl flex-col items-center justify-center gap-2">
                    <div className="w-full max-w-xl">
                        {Array.isArray(jsonFieldsAndContext.fields) &&
                            jsonFieldsAndContext.fields.length === 0 && (
                                <Alert title="Schema Required">
                                    <AlertTitle>Schema Required</AlertTitle>
                                    <AlertCircle />
                                    <AlertDescription>
                                        You haven't defined your dynamic data
                                        structure yet. You must define at least
                                        one schema field before generating your
                                        final metadata layout.
                                    </AlertDescription>
                                </Alert>
                            )}
                    </div>
                    <div className="flex flex-row items-end gap-2">
                        <Button
                            type="button"
                            variant={'secondary'}
                            onClick={() => {
                                setOpenedFieldCreator(true);
                            }}
                            className="cursor-pointer shadow"
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
                </div>
            </form>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="p-4 sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Confirm Generate JSON</DialogTitle>
                        <DialogDescription>
                            {data.images.length} image(s) will be processed.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label>Context</Label>
                                <Badge
                                    variant="secondary"
                                    className={`${!jsonFieldsAndContext.context && 'text-muted-foreground'} `}
                                >
                                    {jsonFieldsAndContext.context ??
                                        'No custom context provided, will use default context.'}
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="">Created fields</Label>
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
                            <Field className="mt-4 flex flex-col gap-2">
                                <FieldLabel>API Key</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        type={showApiKey ? 'text' : 'password'}
                                        defaultValue={data.apiKey}
                                        onChange={(e) => {
                                            setData('apiKey', e.target.value);
                                        }}
                                    />

                                    <InputGroupAddon align="inline-end">
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() =>
                                                setShowApiKey(!showApiKey)
                                            }
                                        >
                                            {showApiKey ? (
                                                <EyeOffIcon className="h-4 w-4" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                                <FieldDescription>
                                    Your API key is only used for this request
                                    and is never stored in our database.
                                </FieldDescription>
                            </Field>
                        </div>
                    </div>

                    <DialogFooter>
                        <div className="flex w-full flex-row-reverse gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirmOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={async () => {
                                    setConfirmOpen(false);
                                    await submitImages();
                                }}
                                size="sm"

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

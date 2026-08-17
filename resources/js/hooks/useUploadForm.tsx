import { useForm, usePage } from '@inertiajs/react';
import imageCompression from 'browser-image-compression';
import { useState } from 'react';
import type { EditableImage } from '@/types';

export function useUploadForm() {
    const { jsonFieldsAndContext, flash } = usePage().props;

    const [currentSource, setCurrentSource] = useState<string>('local');

    const { processing, setData, data, post, transform } = useForm({
        images: [] as EditableImage[],
        remoteUrl: '',
        context: jsonFieldsAndContext?.context || '',
        apiKey: '',
        source: currentSource,
    });

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

    const handleSetApiKey = (key: string) => {
        setData((prev) => ({ ...prev, apiKey: key }));
    };

    const handleSetRemoveUrl = (urls: string) => {
        setData((prev) => ({ ...prev, remoteUrl: urls }));
    };

    const handleRemove = (id?: string) => {
        if (!id) {
            setData((prevData) => ({
                ...prevData,
                images: [],
            }));

            return;
        }

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
    const handleSourceChange = (value: string) => {
        setCurrentSource(value);
    };

    const submitImages = async () => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            // 1. Compress images in parallel
            let compressedEntries: EditableImage[] = [];

            if (currentSource === 'local') {
                compressedEntries = await Promise.all(
                    data.images.map(async (img) => {
                        const compressedFile = await imageCompression(
                            img.file,
                            options,
                        );

                        return { ...img, file: compressedFile };
                    }),
                );
            }

            transform((data) => ({
                ...data,
                images: compressedEntries,
            }));

            post('/imageToJson/upload', {
                preserveState: true,
                preserveScroll: false,
                forceFormData: true,

                onSuccess: () => {
                    const results = flash?.results;
                    console.log('Images submitted successfully:', results);
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

    return {
        handleRemove,
        handleValueChange,
        handleSourceChange,
        handleSubmit,
        handleSetApiKey,
        handleSetRemoveUrl,
        submitImages,
        processing,
        currentSource,
        data,
    };
}

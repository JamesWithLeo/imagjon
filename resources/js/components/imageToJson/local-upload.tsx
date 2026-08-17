import { X, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadList,
    FileUploadTrigger,
} from '@/components/ui/file-upload';
import type { EditableImage } from '@/types/ui';

type LocalUploadProps = {
    data: { images: EditableImage[] };
    onValueChange: (incomingFiles: File[]) => void;
    removeData: (id?: string) => void;
};

export default function LocalUpload({
    data,
    onValueChange,
    removeData,
}: LocalUploadProps) {
    return (
        <>
            <label className="mb-2 block text-sm font-medium text-gray-700">
                Upload folder or images (accepts: png, jpg & webp formats)
            </label>

            <FileUpload
                value={data.images.map((img) => img.file)}
                onValueChange={onValueChange}
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
                                    removeData();
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
                        <FileUploadItem key={file.id} value={file.file}>
                            <FileUploadItemPreview />
                            <FileUploadItemMetadata />

                            <FileUploadItemDelete asChild>
                                <Button
                                    onClick={() => removeData(file.id)}
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
        </>
    );
}

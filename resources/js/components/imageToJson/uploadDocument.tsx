import { usePage } from '@inertiajs/react';
import { AlertCircle, EyeOffIcon, EyeIcon } from 'lucide-react';
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

import { useUploadForm } from '@/hooks/useUploadForm';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { ButtonGroup } from '../ui/button-group';
import { Field, FieldDescription, FieldLabel } from '../ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '../ui/input-group';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Spinner } from '../ui/spinner';
import FieldCreator from './field-creator';
import LocalUpload from './local-upload';
import RemoteUpload from './remote-upload';

export default function UploadDocument() {
    const { jsonFieldsAndContext, flash } = usePage().props;

    const {
        handleRemove,
        handleSourceChange,
        handleSubmit,
        handleValueChange,
        handleSetApiKey,
        submitImages,
        handleSetRemoveUrl,
        data,
        processing,
    } = useUploadForm();

    const remoteUrls = data.remoteUrl
        .split(/[\r\n,]+/)
        .map((url) => url.trim())
        .filter(Boolean);
    const isReadyToSubmit =
        data.source === 'local'
            ? data.images.length > 0
            : remoteUrls.length > 0;

    const [openedFieldCreator, setOpenedFieldCreator] =
        useState<boolean>(false);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [showApiKey, setShowApiKey] = useState<boolean>(false);

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="flex min-h-full w-full max-w-4xl flex-1 grid-cols-1 flex-col items-center space-y-2 px-4 py-8 starting:opacity-0"
            >
                <div className="flex h-full w-full flex-col items-center gap-8">
                    <div className="flex w-full max-w-xl justify-end">
                        <Field orientation="horizontal" className="w-min">
                            <FieldLabel>Source:</FieldLabel>
                            <Select
                                defaultValue={data.source}
                                onValueChange={handleSourceChange}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="local">
                                        Use local files
                                    </SelectItem>
                                    <SelectItem value="remote">
                                        Use remote URL
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <div className="w-full max-w-xl">
                        {data.source === 'local' ? (
                            <>
                                <LocalUpload
                                    data={data}
                                    onValueChange={handleValueChange}
                                    removeData={handleRemove}
                                />
                            </>
                        ) : (
                            <>
                                <RemoteUpload
                                    onChange={handleSetRemoveUrl}
                                    value={data.remoteUrl}
                                />
                            </>
                        )}
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
                    <div className="flex w-full items-center justify-center gap-2">
                        <ButtonGroup className="flex justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpenedFieldCreator(true)}
                                className="cursor-pointer shadow"
                                size="sm"
                            >
                                Define Fields
                            </Button>

                            <Button
                                type="button"
                                className="cursor-pointer shadow"
                                onClick={() => setConfirmOpen(true)}
                                disabled={
                                    processing ||
                                    !isReadyToSubmit ||
                                    jsonFieldsAndContext?.fields.length === 0
                                }
                                size="sm"
                            >
                                {processing ? <Spinner /> : 'Generate Json'}
                            </Button>
                        </ButtonGroup>

                        {/* Conditionally rendered output button sitting directly beside Generate JSON */}
                        {flash?.success && flash.results && (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="shadow"
                            >
                                Output
                            </Button>
                        )}
                    </div>
                </div>
            </form>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="p-4 sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Confirm Generate JSON</DialogTitle>
                        <DialogDescription>
                            {data.source === 'local'
                                ? `${data.images.length} image(s) will be processed.`
                                : `${remoteUrls.length} remote URL(s) will be processed.`}
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
                                        onChange={(e) =>
                                            handleSetApiKey(e.target.value)
                                        }
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
                                size="sm"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    await submitImages();
                                }}
                                disabled={
                                    processing ||
                                    !isReadyToSubmit ||
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

'use client';

import { router, usePage } from '@inertiajs/react';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';
import type { DialogProps } from 'vaul';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { JsonFieldItem } from '@/types';
import { Button } from '../ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '../ui/field';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';

const DATA_TYPES = [
    { label: 'Text', value: 'text' },
    { label: 'Integer', value: 'integer' },
    { label: 'Decimal / Float', value: 'decimal' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'Date', value: 'date' },
    { label: 'Enum', value: 'enum' },
    { label: 'Array', value: 'array' },
];

const parseEnumValues = (raw: string | string[] | undefined) => {
    if (Array.isArray(raw)) {
        return raw
            .map((value) => value.trim())
            .filter((value) => value.length > 0);
    }

    return String(raw ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
};

export default function FieldCreator({ ...props }: DialogProps) {
    const { jsonFieldsAndContext } = usePage().props;

    const [fields, setFields] = useState<JsonFieldItem[]>(
        Array.isArray(jsonFieldsAndContext.fields) &&
            jsonFieldsAndContext.fields.length >= 1
            ? jsonFieldsAndContext.fields
            : [
                  {
                      id: crypto.randomUUID(),
                      fieldName: '',
                      fieldType: '',
                      nameErrorKey: '',
                      typeErrorKey: '',
                      enumValues: '',
                      arrayItemType: '',
                  },
              ],
    );

    const handleAddField = () => {
        setFields((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                fieldName: '',
                fieldType: '',
                nameErrorKey: '',
                typeErrorKey: '',
                enumValues: '',
                arrayItemType: '',
            },
        ]);
    };

    const handleRemoveField = (id: string) => {
        if (fields.length > 1) {
            setFields((prev) => prev.filter((field) => field.id !== id));
        }
    };

    const handleFieldChange = (
        id: string,
        key: keyof JsonFieldItem,
        value: string,
    ) => {
        setFields((prev) =>
            prev.map((field) =>
                field.id === id ? { ...field, [key]: value } : field,
            ),
        );
    };

    const handleFieldSave = () => {
        const cleanedFields = fields
            .filter((field) => field.fieldName.trim() !== '')
            .map((field) => {
                const baseField = {
                    id: field.id,
                    fieldName: field.fieldName.trim(),
                    fieldType: field.fieldType,
                };

                if (field.fieldType === 'enum') {
                    return {
                        ...baseField,
                        enumValues: parseEnumValues(field.enumValues),
                    };
                }

                if (field.fieldType === 'array') {
                    return {
                        ...baseField,
                        arrayItemType: String(field.arrayItemType ?? '').trim(),
                    };
                }

                return baseField;
            });

        const context = document.getElementById(
            'context',
        ) as HTMLTextAreaElement;

        router.post(
            '/set-fields',
            { fields: cleanedFields, context: context.value },
            {
                preserveScroll: false,
                onSuccess: () => {
                    props.onOpenChange?.(false);
                },
                onError: (e) => {
                    console.error('Validation failed:', e);
                },
            },
        );
    };

    return (
        <Drawer {...props} direction="right">
            <DrawerContent className="flex h-full w-2xl flex-col select-none md:min-w-2xl">
                <DrawerHeader className="flex h-20 w-full flex-row items-center">
                    <DrawerTitle>Add data fields</DrawerTitle>
                </DrawerHeader>
                <section className="flex flex-1 flex-col justify-between overflow-hidden">
                    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4">
                        {fields.length > 0 && (
                            <div className="grid grid-cols-[2fr_1fr] items-center gap-x-4 gap-y-2">
                                {fields.map((field) => (
                                    <Field
                                        key={field.id}
                                        className={`col-span-2 grid grid-cols-[2fr_1fr_min-content] rounded bg-secondary p-4`}
                                    >
                                        <Label className="col-start-1">
                                            Field name
                                        </Label>
                                        <Label className="col-start-2">
                                            Data type
                                        </Label>
                                        <div></div>
                                        <Input
                                            aria-invalid={
                                                field.fieldName === ''
                                            }
                                            value={field.fieldName}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    field.id,
                                                    'fieldName',
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-background"
                                            placeholder="e.g., price, description, stock"
                                            required
                                        />

                                        <Select
                                            value={field.fieldType}
                                            onValueChange={(value) =>
                                                handleFieldChange(
                                                    field.id,
                                                    'fieldType',
                                                    value,
                                                )
                                            }
                                            defaultValue=""
                                        >
                                            <SelectTrigger
                                                className="w-full bg-background"
                                                aria-invalid={
                                                    field.fieldType === ''
                                                }
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {DATA_TYPES.map((type) => (
                                                        <SelectItem
                                                            key={type.value}
                                                            value={type.value}
                                                        >
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            variant="ghost"
                                            type="button"
                                            onClick={() =>
                                                handleRemoveField(field.id)
                                            }
                                            className={`${fields.length <= 1 ? 'cursor-not-allowed' : 'cursor-pointer'} text-muted-foreground transition-colors hover:text-destructive disabled:opacity-30 disabled:hover:text-muted-foreground`}
                                        >
                                            <X />
                                        </Button>

                                        {field.fieldName === '' && (
                                            <FieldError>
                                                Field name cannot be empty
                                            </FieldError>
                                        )}
                                        {field.fieldType === 'enum' && (
                                            <Field className="col-span-3">
                                                <FieldLabel>
                                                    Enum values
                                                </FieldLabel>
                                                <Textarea
                                                    rows={2}
                                                    className="bg-background"
                                                    value={
                                                        Array.isArray(
                                                            field.enumValues,
                                                        )
                                                            ? field.enumValues.join(
                                                                  ', ',
                                                              )
                                                            : String(
                                                                  field.enumValues ??
                                                                      '',
                                                              )
                                                    }
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            field.id,
                                                            'enumValues',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="red, green, blue"
                                                />
                                                <FieldDescription>
                                                    Add the accepted enum
                                                    options, separated by
                                                    commas.
                                                </FieldDescription>
                                            </Field>
                                        )}

                                        {field.fieldType === 'array' && (
                                            <Field className="col-span-3">
                                                <FieldLabel>
                                                    Array item type
                                                </FieldLabel>
                                                <Input
                                                    value={
                                                        field.arrayItemType ??
                                                        ''
                                                    }
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            field.id,
                                                            'arrayItemType',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="bg-background"
                                                    placeholder="string, number, boolean"
                                                />
                                                <FieldDescription>
                                                    Optional item type hint for
                                                    the array.
                                                </FieldDescription>
                                            </Field>
                                        )}
                                    </Field>
                                ))}
                            </div>
                        )}

                        <Separator />
                        <div className="flex w-full justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddField}
                            >
                                <Plus /> Add another field
                            </Button>
                        </div>
                    </div>

                    <FieldGroup className="px-4 py-4">
                        <Field>
                            <FieldLabel htmlFor="context">Context</FieldLabel>
                            <Textarea
                                rows={4}
                                defaultValue={jsonFieldsAndContext.context}
                                id="context"
                                placeholder="Adding context guides the processing engine on how to handle structural edge cases or unique fields."
                            />
                            <FieldDescription>
                                Provide specific hints, schemas, or parsing
                                rules to help the parser extract data from your
                                images more accurately.
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                    <DrawerFooter className="mx-auto flex w-full flex-row justify-end gap-4">
                        <Button
                            onClick={handleFieldSave}
                            disabled={fields.length <= 0}
                        >
                            Save
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </section>
            </DrawerContent>
        </Drawer>
    );
}

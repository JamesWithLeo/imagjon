'use client';

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '../ui/button';
import { DialogProps } from 'vaul';
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { Separator } from '../ui/separator';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '../ui/field';
import { Textarea } from '../ui/textarea';
import { FormField } from '@/types';

// Corrected items to map actual schema data types
const DATA_TYPES = [
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'Date', value: 'date' },
];

export default function FieldCreator({
    fields,
    setFields,
    ...props
}: {
    fields: FormField[];
    setFields: React.Dispatch<React.SetStateAction<FormField[]>>;
} & DialogProps) {
    const handleAddField = () => {
        setFields((prev) => [
            ...prev,
            { id: crypto.randomUUID(), name: '', type: 'text' },
        ]);
    };

    const handleRemoveField = (id: string) => {
        // Keep at least one row visible if preferred, or allow clearing all
        setFields((prev) => prev.filter((field) => field.id !== id));
    };

    const handleFieldChange = (
        id: string,
        key: keyof FormField,
        value: string,
    ) => {
        setFields((prev) =>
            prev.map((field) =>
                field.id === id ? { ...field, [key]: value } : field,
            ),
        );
    };

    return (
        <Drawer {...props} direction="right">
            <DrawerContent className="flex h-full w-full flex-col select-none">
                <DrawerHeader className="flex h-20 w-full flex-row items-center">
                    <DrawerTitle>Add data fields</DrawerTitle>
                </DrawerHeader>
                <section className="flex flex-1 flex-col justify-between overflow-hidden">
                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6">
                        {fields.length > 0 && (
                            <div className="grid grid-cols-[2fr_1fr_min-content] items-center gap-x-4 gap-y-2">
                                <Label>Field name</Label>
                                <Label>Data type</Label>
                                <div className="w-9" />{' '}
                                {/* Visual spacing block balancing the action row button */}
                                {/* Dynamic Field Input Rows */}
                                {fields.map((field) => (
                                    <React.Fragment key={field.id}>
                                        <Input
                                            value={field.name}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    field.id,
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., price, description, stock "
                                            required
                                        />

                                        <Select
                                            value={field.type}
                                            onValueChange={(value) =>
                                                handleFieldChange(
                                                    field.id,
                                                    'type',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
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
                                            size="icon"
                                            type="button"
                                            onClick={() =>
                                                handleRemoveField(field.id)
                                            }
                                            disabled={fields.length === 1}
                                            className={`${fields.length <= 1 ? 'cursor-not-allowed' : 'cursor-pointer'}text-muted-foreground transition-colors hover:text-destructive disabled:opacity-30 disabled:hover:text-muted-foreground`}
                                        >
                                            <X />
                                        </Button>
                                    </React.Fragment>
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

                    <div className="px-4 py-4">
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="context">
                                        Context
                                    </FieldLabel>
                                    <Textarea
                                        rows={4}
                                        id="context"
                                        placeholder="Adding context guides the processing engine on how to handle structural edge cases or unique fields."
                                    />
                                    <FieldDescription>
                                        Provide specific hints, schemas, or
                                        parsing rules to help the parser extract
                                        data from your images more accurately.
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </div>
                    <DrawerFooter className="mx-auto flex w-full flex-col justify-end gap-4">
                        <Button
                            onClick={() => {
                                console.log(fields);
                                setFields(fields);
                            }}
                        >
                            Save
                        </Button>
                        <DrawerClose className="">
                            <Button
                                className="w-full"
                                variant="outline"
                                type="button"
                                // onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </section>
            </DrawerContent>
        </Drawer>
    );
}

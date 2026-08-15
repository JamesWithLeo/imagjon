import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type AppVariant = 'header' | 'sidebar';

export type FlashToast = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
};

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};

export interface JsonFieldItem {
    id: string;
    fieldName: string;
    fieldType: string;
    nameErrorKey?: string;
    typeErrorKey?: string;
    enumValues?: string[] | string;
    arrayItemType?: string;
    [key: string]: string | number | boolean | null | undefined | string[];
}
export interface EditableImage {
    id: string;
    file: File;
    previewUrl: string;
    customName: string;
}

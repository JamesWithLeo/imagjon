import type { Auth } from '@/types/auth';
import type { JsonFieldItem } from './ui';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

export interface FlashProps {
    success?: string | null;
    error?: string | null;
    results?: any;
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            fieldCreatorModalOpen: boolean;
            jsonFieldsAndContext: { fields: JsonFieldItem[]; context: string };
            flash: FlashProps;
            [key: string]: unknown;
        };
    }
}

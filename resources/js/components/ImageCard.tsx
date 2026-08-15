import { ReplaceIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import type { EditableImage } from '@/types/ui';

export default function ImageCard(data: EditableImage) {
    return (
        <div
            key={data.id}
            className="group relative aspect-square h-50 w-full space-y-2 rounded-lg border p-3"
        >
            <ButtonGroup className="absolute top-4 right-4 z-10 flex flex-row justify-end rounded-lg bg-black/50 p-1 text-white backdrop-blur-2xl">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            // onClick={() => triggerReplace(data.id)}
                            variant="ghost"
                            size="icon-xs"
                            type="button"
                        >
                            <ReplaceIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Replace Image</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            // onClick={() => handleRemove(data.id)}
                            variant="ghost"
                            size="icon-xs"
                            type="button"
                        >
                            <X />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Remove Image</TooltipContent>
                </Tooltip>
            </ButtonGroup>

            <img
                src={data.previewUrl}
                alt={data.customName}
                className="h-full w-full rounded object-cover"
            />

            <div className="absolute bottom-3 left-0 w-full px-3 text-sm">
                <input
                    type="text"
                    value={data.customName}
                    // onChange={(e) => handleRename(data.id, e.target.value)}
                    className="relative bottom-0 left-0 w-full rounded border border-neutral-700 bg-neutral-900/80 p-1 text-sm text-white focus:outline-none"
                />
            </div>
        </div>
    );
}

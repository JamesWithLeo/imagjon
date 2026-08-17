import { Field, FieldDescription } from '../ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupText,
    InputGroupTextarea,
} from '../ui/input-group';
type RemoteUploadProps = {
    onChange: (value: string) => void;
    value: string;
};
export default function RemoteUpload({ onChange, value }: RemoteUploadProps) {
    return (
        <>
            <Field>
                <InputGroup className="h-auto bg-white dark:bg-background">
                    <InputGroupTextarea
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        className="min-h-40"
                        onChange={(e) => onChange(e.target.value)}
                        value={value}
                    />

                    <InputGroupAddon align="block-start" className="border-b">
                        <InputGroupText>Remote Image URLs</InputGroupText>
                        <InputGroupButton
                            className="ml-auto"
                            size="xs"
                            onClick={() => onChange('')}
                        >
                            Clear
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                    Separate multiple URLs with commas.
                </FieldDescription>
            </Field>
        </>
    );
}

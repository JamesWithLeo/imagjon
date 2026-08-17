<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

abstract class ImageToJsonController extends Controller
{
    protected function normalizeFields(Request $request): array
    {
        $rawFields = $request->input('fields');

        if (is_string($rawFields)) {
            $rawFields = json_decode($rawFields, true) ?? [];
            $request->merge(['fields' => $rawFields]);
        }

        return $request->input('fields', []);
    }

    protected function buildFieldSchemaDescription(array $fields): string
    {
        $schemaParts = [];

        foreach ($fields as $field) {
            $fieldName = trim((string) ($field['fieldName'] ?? ''));
            $fieldType = strtolower((string) ($field['fieldType'] ?? 'text'));

            if ($fieldName === '') {
                continue;
            }

            $typeHint = $fieldType;

            if ($fieldType === 'enum' && ! empty($field['enumValues'] ?? [])) {
                $typeHint .= ': ' . implode(', ', array_map('strval', (array) $field['enumValues']));
            }

            if ($fieldType === 'array') {
                $arrayItemType = trim((string) ($field['arrayItemType'] ?? 'string'));
                $typeHint = 'array<' . ($arrayItemType !== '' ? $arrayItemType : 'string') . '>';
            }

            $schemaParts[] = $fieldName . ' (' . $typeHint . ')';
        }

        return implode(', ', $schemaParts);
    }

    protected function buildExtractionPrompt(array $fields, ?string $userContext = null, ?string $sourceHint = null): string
    {
        $targetSchema = $this->buildFieldSchemaDescription($fields);

        $prompt = "You are an advanced, domain-agnostic multimodal data extraction and context synthesis engine. " .
            "Your task is to analyze the provided image and extract or generate data to accurately populate a database record with these exact keys: [{$targetSchema}].\n\n";

        if (! empty($userContext)) {
            $prompt .= "CRITICAL USER CONTEXT & PARSING INSTRUCTIONS:\n" .
                "The user has provided the following domain context or operational hints. Prioritize this context when interpreting the image:\n" .
                "\"{$userContext}\"\n\n";
        }

        if (! empty($sourceHint)) {
            $prompt .= "SOURCE CONTEXT:\n" .
                "The image was retrieved from {$sourceHint}. Ignore local filesystem metadata and analyze only the image content.\n\n";
        }

        $prompt .= "Adhere strictly to these high-fidelity injection rules:\n" .
            "1. TYPE SAFETY: Return values that match the requested schema exactly. Use integer for whole numbers, decimal/float for fractional values, boolean for true/false, date in ISO format, enum values only from the allowed list, and arrays as JSON arrays.\n" .
            "2. REAL-WORLD PRICING & VALUATION: If a 'price', 'cost', 'msrp', or value-based field is requested, evaluate the item's visible identifiers, " .
            "brand, variant, and condition. Infer a highly realistic, market-accurate real-world price based on current macroeconomic retail or commercial benchmarks. " .
            "Return ONLY a clean number or float (e.g., 29.99) without currency symbols.\n" .
            "3. ELABORATE & SUBSTANTIVE DETAILS: For any field requiring a textual narrative or string structure (such as 'description', 'specifications', 'summary', or 'details'), " .
            "do NOT return short, single-word answers or fragments. Synthesize a comprehensive, multi-sentence detail block. For physical items, describe their design, " .
            "apparent material/packaging, primary features, and primary real-world use cases. For documents or text-heavy images, summarize the core themes deeply.\n" .
            "4. INTELLIGENT INFERENCE & CONTEXT OVERRIDE: If a specific key cannot be literally read or transcribed from text within the image, " .
            "use the contextual, visual, and conceptual clues in the image (along with any provided User Context) to infer the most accurate real-world industry match rather than returning null.\n\n" .
            "Format the final output strictly as a single flat JSON object mapping perfectly and exclusively to the requested keys.";

        return $prompt;
    }

    protected function extractWithGemini(
        string $base64Image,
        string $mimeType,
        array $fields,
        ?string $userContext,
        string $apiKey,
        ?string $sourceHint = null
    ): array {
        if (! $apiKey) {
            return ['error' => 'Gemini API key is not configured in services.php / .env'];
        }

        $prompt = $this->buildExtractionPrompt($fields, $userContext, $sourceHint);

        try {
            $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

            $response = Http::withHeaders([
                'X-goog-api-key' => $apiKey,
            ])->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $base64Image,
                                ],
                            ],
                            [
                                'text' => $prompt,
                            ],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                ],
            ]);

            if ($response->successful()) {
                $jsonString = $response->json('candidates.0.content.parts.0.text', '{}');
                return json_decode($jsonString, true) ?? [];
            }

            $errorMessage = $response->json('error.message') ?? 'Unknown API Error';
            return ['error' => 'Gemini API status ' . $response->status() . ': ' . $errorMessage];
        } catch (\Exception $e) {
            return ['error' => 'Connection failed: ' . $e->getMessage()];
        };

    }
}

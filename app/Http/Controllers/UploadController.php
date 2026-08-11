<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class UploadController extends Controller
{
    public function storeMultiple(Request $request)
    {
        // 1. Strict Validation
        $request->validate([
            'images' => 'required|array|min:1',
            'images.*' => 'required|file|mimes:png,jpg,jpeg,webp|max:10240', // Safe Mime types up to 10MB
            'custom_names' => 'nullable|array',
            'custom_names.*' => 'nullable|string|max:255',
            'fields' => 'nullable|array',
        ]);

        $files = $request->file('images');
        $customNames = $request->input('custom_names', []);
        $fields = $request->input('fields', ['name', 'brand', 'price']); // Default target fields fallback

        $results = [];

        foreach ($files as $index => $file) {
            $originalName = $file->getClientOriginalName();

            $rawCustomName = $customNames[$index] ?? null;
            $finalCustomName = !empty($rawCustomName)
                ? $rawCustomName
                : pathinfo($originalName, PATHINFO_FILENAME);

            //  Secure handle for system disk storage (Never use user input for raw path write operations)
            $secureStorageName = $file->hashName();

            // If you want to store the file on disk:
            // $path = $file->storeAs('raw_images', $secureStorageName);

            $originalName = $file->getClientOriginalName();

            $imageBytes = $file->getContent();
            $base64Image = base64_encode($imageBytes);
            $mimeType = $file->getClientMimeType() ?: $file->getMimeType();

            $extractedData = $this->extractWithGemini($base64Image, $mimeType, $fields);

            $results[] = [
                'index'         => $index,
                'custom_name'   => $finalCustomName,
                'original_name' => $originalName,
                'storage_name'  => $secureStorageName,
                'data'          => $extractedData,
            ];
        }

        // Return the full array directly back to React state to be shown in the Modal
        return response()->json($results);
    }

    private function extractWithGemini(string $base64Image, string $mimeType, array $fields): array
    {
        $apiKey = config('services.gemini.key');

        if (!$apiKey) {
            return ['error' => 'Gemini API key is not configured in services.php / .env'];
        }

        $targetSchema = implode(', ', $fields);

        $prompt = "You are an advanced, domain-agnostic multimodal data extraction and context synthesis engine. " .
            "Your task is to analyze the provided image and extract or generate data to accurately populate a database record with these exact keys: [{$targetSchema}].\n\n" .

            "Adhere strictly to these high-fidelity injection rules:\n" .
            "1. REAL-WORLD PRICING & VALUATION: If a 'price', 'cost', 'msrp', or value-based field is requested, evaluate the item's visible identifiers, " .
            "brand, variant, and condition. Infer a highly realistic, market-accurate real-world price based on current macroeconomic retail or commercial benchmarks. " .
            "Return ONLY a clean number or float (e.g., 29.99) without currency symbols.\n" .

            "2. ELABORATE & SUBSTANTIVE DETAILS: For any field requiring a textual narrative or string structure (such as 'description', 'specifications', 'summary', or 'details'), " .
            "do NOT return short, single-word answers or fragments. Synthesize a comprehensive, multi-sentence detail block. For physical items, describe their design, " .
            "apparent material/packaging, primary features, and primary real-world use cases. For documents or text-heavy images, summarize the core themes deeply.\n" .

            "3. INTELLIGENT INFERENCE: If a specific key cannot be literally read or transcribed from text within the image, " .
            "use the contextual, visual, and conceptual clues in the image to infer the most accurate real-world industry match rather than returning null.\n\n" .

            "Format the final output strictly as a single flat JSON object mapping perfectly and exclusively to the requested keys.";

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

            $response = Http::withHeaders([
                'X-goog-api-key' => $apiKey,
            ])->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data'      => $base64Image,
                                ],
                            ],
                            [
                                'text' => $prompt
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
        }
    }
}

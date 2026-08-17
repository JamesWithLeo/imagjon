<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class RemoteUrlController extends ImageToJsonController
{
    public function storeMultiple(Request $request)
    {
        $fields = $this->normalizeFields($request);

        $request->validate([
            'remoteUrl' => 'required|string|max:5000',
            'fields' => 'required|array|min:1',
            'fields.*' => 'required|array',
            'fields.*.fieldName' => 'required|string|max:255',
            'fields.*.fieldType' => 'required|string|in:text,number,integer,decimal,float,boolean,date,enum,array',
            'fields.*.enumValues' => 'nullable|array',
            'fields.*.enumValues.*' => 'nullable|string|max:255',
            'fields.*.arrayItemType' => 'nullable|string|max:50',
            'context' => 'nullable|string|max:1000',
            'apiKey' => 'required|string|max:255',
        ], [
            'remoteUrl.required' => 'Please enter one or more remote image URLs.',
        ]);

        $remoteUrls = preg_split('/[\r\n,]+/', (string) $request->input('remoteUrl', '')) ?: [];
        $remoteUrls = array_values(array_filter(array_map('trim', $remoteUrls)));

        if ($remoteUrls === []) {
            throw ValidationException::withMessages([
                'remoteUrl' => 'Please enter at least one remote image URL.',
            ]);
        }

        $context = $request->input('context');
        $apiKey = $request->input('apiKey');
        $results = [];

        foreach ($remoteUrls as $index => $remoteUrl) {
            if (! filter_var($remoteUrl, FILTER_VALIDATE_URL)) {
                throw ValidationException::withMessages([
                    'remoteUrl' => 'Remote image URL #' . ($index + 1) . ' is not valid.',
                ]);
            }

            $response = Http::timeout(30)->get($remoteUrl);

            if (! $response->successful()) {
                throw ValidationException::withMessages([
                    'remoteUrl' => 'Unable to fetch remote image #' . ($index + 1) . ' from ' . $remoteUrl . '.',
                ]);
            }

            $mimeType = trim(explode(';', (string) $response->header('Content-Type', ''))[0]);

            if ($mimeType === '' || ! str_starts_with($mimeType, 'image/')) {
                throw ValidationException::withMessages([
                    'remoteUrl' => 'Remote URL #' . ($index + 1) . ' did not return an image file.',
                ]);
            }

            $imageBytes = $response->body();

            if ($imageBytes === '') {
                throw ValidationException::withMessages([
                    'remoteUrl' => 'Remote URL #' . ($index + 1) . ' returned an empty file.',
                ]);
            }

            $originalName = basename((string) parse_url($remoteUrl, PHP_URL_PATH)) ?: 'remote-image-' . ($index + 1);
            $finalCustomName = pathinfo($originalName, PATHINFO_FILENAME) ?: 'remote-image-' . ($index + 1);
            $base64Image = base64_encode($imageBytes);

            $extractedData = $this->extractWithGemini(
                $base64Image,
                $mimeType,
                $fields,
                $context,
                $apiKey,
                'a remote URL',
            );

            $results[] = [
                'index' => $index,
                'custom_name' => $finalCustomName,
                'original_name' => $originalName,
                'storage_name' => $finalCustomName,
                'data' => $extractedData,
            ];
        }

        return redirect()->back()->with('results', $results);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LocalFileController extends ImageToJsonController
{
    public function storeMultiple(Request $request)
    {
        $fields = $this->normalizeFields($request);

        $request->validate([
            'images' => 'required|array|min:1',
            'images.*' => 'required|file|mimes:png,jpg,jpeg,webp|max:10240',
            'custom_names' => 'nullable|array',
            'custom_names.*' => 'nullable|string|max:255',
            'fields' => 'required|array|min:1',
            'fields.*' => 'required|array',
            'fields.*.fieldName' => 'required|string|max:255',
            'fields.*.fieldType' => 'required|string|in:text,number,integer,decimal,float,boolean,date,enum,array',
            'fields.*.enumValues' => 'nullable|array',
            'fields.*.enumValues.*' => 'nullable|string|max:255',
            'fields.*.arrayItemType' => 'nullable|string|max:50',
            'context' => 'nullable|string|max:1000',
            'apiKey' => 'required|string|max:255',
        ]);

        $files = $request->file('images');
        $customNames = $request->input('custom_names', []);
        $context = $request->input('context');
        $apiKey = $request->input('apiKey');
        $results = [];

        foreach ($files as $index => $file) {
            $originalName = $file->getClientOriginalName();

            $rawCustomName = $customNames[$index] ?? null;
            $finalCustomName = ! empty($rawCustomName)
                ? $rawCustomName
                : pathinfo($originalName, PATHINFO_FILENAME);

            $imageBytes = $file->getContent();
            $base64Image = base64_encode($imageBytes);
            $mimeType = $file->getClientMimeType() ?: $file->getMimeType();

            $extractedData = $this->extractWithGemini($base64Image, $mimeType, $fields, $context, $apiKey);

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

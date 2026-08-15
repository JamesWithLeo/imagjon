<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FieldController extends Controller
{
    public function setFields(Request $request)
    {
        $validated = $request->validate([
            'fields'             => 'required|array|min:1',
            'fields.*'           => 'required|array',
            'fields.*.id'        => 'required|string|distinct',
            'fields.*.fieldName' => 'required|string|max:255|distinct',
            'fields.*.fieldType' => 'required|string|in:text,number,integer,decimal,float,boolean,date,enum,array',
            'fields.*.enumValues' => 'nullable|array',
            'fields.*.enumValues.*' => 'nullable|string|max:255',
            'fields.*.arrayItemType' => 'nullable|string|max:50',
            'context'            => 'nullable|string',
        ]);

        $normalizedFields = array_map(function (array $field): array {
            $normalized = [
                'id' => (string) $field['id'],
                'fieldName' => trim((string) $field['fieldName']),
                'fieldType' => (string) $field['fieldType'],
            ];

            if (($field['fieldType'] ?? null) === 'enum' && isset($field['enumValues'])) {
                $normalized['enumValues'] = array_values(array_filter(
                    array_map(fn ($value) => trim((string) $value), (array) $field['enumValues']),
                    fn ($value) => $value !== ''
                ));
            }

            if (($field['fieldType'] ?? null) === 'array' && ! empty($field['arrayItemType'] ?? '')) {
                $normalized['arrayItemType'] = trim((string) $field['arrayItemType']);
            }

            return $normalized;
        }, $validated['fields']);

        session([
            'jsonFieldsAndContext' => [
                'fields' => $normalizedFields,
                'context' => $validated['context'] ?? null,
            ],
        ]);

        return back();
    }

    public function resetFields()
    {
        session()->forget('jsonFieldsAndContext');

        return back();
    }
}

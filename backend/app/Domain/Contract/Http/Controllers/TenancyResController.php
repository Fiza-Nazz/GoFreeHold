<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Models\TenancyRes;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenancyResController extends Controller
{
    private function rules(bool $required = true): array
    {
        return [
            'contract_id'        => ($required ? 'required|' : '') . 'exists:contracts,id',
            'owner_name'         => 'nullable|string|max:255',
            'lessor_name'        => 'nullable|string|max:255',
            'lessor_emirates_id' => 'nullable|string|max:255',
            'lessor_license_no'  => 'nullable|string|max:255',
            'lessor_email'       => 'nullable|email|max:255',
            'lessor_phone'       => 'nullable|string|max:50',
            'tenant_name'        => 'nullable|string|max:255',
            'tenant_emirates_id' => 'nullable|string|max:255',
            'tenant_license_no'  => 'nullable|string|max:255',
            'tenant_email'       => 'nullable|email|max:255',
            'tenant_phone'       => 'nullable|string|max:50',
            'plot_no'            => 'nullable|string|max:255',
            'property_name'      => 'nullable|string|max:255',
            'property_usage'     => 'nullable|string|max:100',
            'property_area'      => 'nullable|string|max:255',
            'premises_no'        => 'nullable|string|max:255',
            'property_type'      => 'nullable|string|max:100',
            'location'           => 'nullable|string|max:500',
            'annual_rent'        => 'nullable|numeric|min:0',
            'period_from'        => 'nullable|date',
            'period_to'          => 'nullable|date',
            'security_deposit'   => 'nullable|numeric|min:0',
            'mode_of_payment'    => 'nullable|string|max:255',
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $query = TenancyRes::with('contract:id,unit_id,tenant_id');

        if ($request->has('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }

        return response()->json(['status' => 'success', 'data' => ['tenancy_res' => $query->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules());
        $tenancyRes = TenancyRes::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Tenancy form saved.', 'data' => ['tenancy_res' => $tenancyRes]], 201);
    }

    public function show(TenancyRes $tenancyRes): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['tenancy_res' => $tenancyRes->load('contract')]]);
    }

    public function update(Request $request, TenancyRes $tenancyRes): JsonResponse
    {
        $validated = $request->validate($this->rules(false));
        $tenancyRes->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Tenancy form updated.', 'data' => ['tenancy_res' => $tenancyRes]]);
    }

    public function destroy(TenancyRes $tenancyRes): JsonResponse
    {
        $tenancyRes->delete();

        return response()->json(['status' => 'success', 'message' => 'Tenancy form deleted.']);
    }
}
<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Models\Contract;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ContractPdfController extends Controller
{
    /**
     * Generate UAE/Ejari-style residential tenancy PDF for a contract.
     * Pulls contract + unit/property + tenancy_res + terms + addendum (c1–c8) + cheques.
     */
    public function generate(Request $request, Contract $contract): Response
    {
        $contract->load([
            'unit.property',
            'unit.unitItems',
            'tenant',
            'owner',
            'tenancyRes',
            'tenancyContracts',
            'terms',
            'cheques',
        ]);

        $docType = $request->query('type', 'contract'); // contract | renewal | terms | addendum

        $data = [
            'contract'     => $contract,
            'unit'         => $contract->unit,
            'building'     => $contract->unit?->property,
            'tenant'       => $contract->tenant,
            'owner'        => $contract->owner,
            'res'          => $contract->tenancyRes,
            'addendum'     => $contract->tenancyContracts->first(),
            'termsList'    => $contract->terms,
            'cheques'      => $contract->cheques,
            'unit_items'   => $contract->unit?->unitItems,
            'doc_type'     => $docType,
            'generated_at' => now()->format('d M Y'),
        ];

        $pdf = Pdf::loadView('pdf.tenancy-contract', $data)
            ->setPaper('a4', 'portrait')
            ->setOption('isHtml5ParserEnabled', true)
            ->setOption('isRemoteEnabled', true);

        $filename = 'GoFreeHold_Tenancy_' . $contract->id . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Alias for generate method for route compatibility.
     */
    public function export(Request $request, Contract $contract): Response
    {
        return $this->generate($request, $contract);
    }
}

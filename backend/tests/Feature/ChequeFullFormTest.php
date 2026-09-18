<?php

namespace Tests\Feature;

use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Models\ContractCheque;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ChequeFullFormTest extends TestCase
{
    use DatabaseTransactions;

    private function payload(): array
    {
        return ['contract_id' => Contract::factory()->create()->id, 'account_holder_name' => 'Test Holder',
            'payee_name' => 'Test Payee', 'nature' => 'RENT', 'type' => 'CROSS', 'bank_name' => 'Test Bank',
            'amount' => '1250.50', 'due_date' => '2026-12-01', 'notes' => 'Test remarks'];
    }

    public function test_all_fields_persist_and_attachment_downloads_privately(): void
    {
        Storage::fake('local');
        $this->actingAs($this->adminUser());
        $payload = [...$this->payload(), 'cheque_number' => 'TEST-FULL'];
        $response = $this->post('/api/admin/contract-cheques', [...$payload,
            'cheque_image' => UploadedFile::fake()->create('test.pdf', 12, 'application/pdf')], ['Accept' => 'application/json']);
        $response->assertCreated()->assertJsonPath('data.cheque.has_cheque_image', true)->assertJsonMissingPath('data.cheque.cheque_image_path');
        $id = $response->json('data.cheque.id');
        $this->assertDatabaseHas('contract_cheques', [...$payload, 'id' => $id]);
        $cheque = ContractCheque::findOrFail($id);
        Storage::disk('local')->assertExists($cheque->cheque_image_path);
        foreach (['/api/admin/contract-cheques?contract_id='.$payload['contract_id'], '/api/admin/contracts/'.$payload['contract_id'].'/cheques'] as $listUrl) {
            $this->getJson($listUrl)->assertOk()->assertJsonFragment(['account_holder_name' => 'Test Holder', 'payee_name' => 'Test Payee', 'nature' => 'RENT', 'type' => 'CROSS', 'notes' => 'Test remarks', 'has_cheque_image' => true]);
        }
        $this->getJson('/api/admin/contracts/'.$payload['contract_id'])->assertOk()->assertJsonFragment(['account_holder_name' => 'Test Holder']);
        $base = '/api/admin/contracts/'.$payload['contract_id'].'/cheques/'.$id;
        $this->get($base.'/attachment')->assertOk()->assertDownload('cheque-attachment.pdf');
        $other = Contract::factory()->create();
        $this->getJson('/api/admin/contracts/'.$other->id.'/cheques/'.$id.'/attachment')->assertNotFound();
        $this->putJson($base, ['status' => 'cleared'])->assertOk();
        $this->assertDatabaseHas('contract_cheques', ['id' => $id, 'status' => 'cleared', 'payee_name' => 'Test Payee']);
        $this->deleteJson($base)->assertOk();
        Storage::disk('local')->assertMissing($cheque->cheque_image_path);
        $this->assertDatabaseMissing('contract_cheques', ['id' => $id]);
    }

    public function test_optional_number_and_attachment_and_all_natures(): void
    {
        $this->actingAs($this->adminUser());
        $payload = $this->payload();
        foreach (['RENT', 'DEPOSIT', 'MAINTENANCE', 'OTHER'] as $nature) {
            $this->postJson('/api/admin/contract-cheques', [...$payload, 'nature' => $nature])
                ->assertCreated()->assertJsonPath('data.cheque.nature', $nature)->assertJsonPath('data.cheque.has_cheque_image', false);
        }
    }

    public function test_required_fields_and_invalid_values_are_rejected(): void
    {
        $this->actingAs($this->adminUser());
        $payload = $this->payload();
        foreach (array_keys($payload) as $key) {
            $data = $payload; unset($data[$key]);
            $this->postJson('/api/admin/contract-cheques', $data)->assertUnprocessable()->assertJsonValidationErrors($key);
        }
        foreach (['nature' => 'INVALID', 'amount' => '-1', 'due_date' => 'bad date', 'contract_id' => 99999999, 'type' => str_repeat('a', 101)] as $key => $value) {
            $this->postJson('/api/admin/contract-cheques', [...$payload, $key => $value])->assertUnprocessable()->assertJsonValidationErrors($key);
        }
        $this->postJson('/api/admin/contract-cheques', [...$payload, 'amount' => '12.345'])->assertUnprocessable()->assertJsonValidationErrors('amount');
    }

    public function test_upload_formats_and_size_are_validated(): void
    {
        Storage::fake('local');
        $this->actingAs($this->adminUser());
        $payload = $this->payload();
        foreach ([UploadedFile::fake()->create('bad.txt', 10, 'text/plain'), UploadedFile::fake()->create('large.pdf', 5121, 'application/pdf')] as $file) {
            $this->post('/api/admin/contract-cheques', [...$payload, 'cheque_image' => $file], ['Accept' => 'application/json'])
                ->assertUnprocessable()->assertJsonValidationErrors('cheque_image');
        }
        foreach (['jpg' => 'image/jpeg', 'png' => 'image/png', 'pdf' => 'application/pdf'] as $extension => $mime) {
            $this->post('/api/admin/contract-cheques', [...$payload, 'cheque_image' => UploadedFile::fake()->create('valid.'.$extension, 5120, $mime)], ['Accept' => 'application/json'])->assertCreated();
        }
    }

    public function test_legacy_quick_add_and_permissions(): void
    {
        $this->actingAs($this->adminUser());
        $payload = $this->payload();
        $legacy = array_intersect_key($payload, array_flip(['bank_name', 'amount', 'due_date']));
        $response = $this->postJson('/api/admin/contracts/'.$payload['contract_id'].'/cheques', [...$legacy, 'cheque_number' => 'LEGACY']);
        $response->assertCreated();
        $id = $response->json('data.cheque.id');
        $this->actingAs($this->tenantUser());
        $this->postJson('/api/admin/contract-cheques', $payload)->assertForbidden();
        $this->getJson('/api/admin/contracts/'.$payload['contract_id'].'/cheques/'.$id.'/attachment')->assertForbidden();
    }
}

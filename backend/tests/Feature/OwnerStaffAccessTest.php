<?php
namespace Tests\Feature;

use App\Domain\Auth\Models\{User,Owner,OwnerStaff,StaffInvitation};
use App\Domain\Auth\Notifications\StaffInvitationNotification;
use App\Domain\Property\Models\{Property,Unit};
use App\Domain\Contract\Models\Contract;
use App\Domain\Maintenance\Models\{Complaint,Job};
use App\Domain\Payment\Models\{Payment,RentTransaction};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{DB,Notification};
use Illuminate\Support\Str;
use Tests\TestCase;

class OwnerStaffAccessTest extends TestCase
{
    use RefreshDatabase;
    private Owner $a;
    private Owner $b;
    private Contract $ca;
    private Contract $cb;
    protected function setUp(): void
    {
        parent::setUp();
        User::factory()->count(3)->create(['role'=>'tenant']);
        $this->a=Owner::factory()->create();
        $this->b=Owner::factory()->create();
        $this->ca=$this->contract($this->a);
        $this->cb=$this->contract($this->b);
    }
    private function contract(Owner $owner): Contract
    {
        $property=Property::factory()->create(['owner_id'=>$owner->id]);
        $unit=Unit::factory()->create(['property_id'=>$property->id,'owner_id'=>$owner->id]);
        return Contract::factory()->create(['unit_id'=>$unit->id,'owner_id'=>$owner->id]);
    }
    private function staff(Owner $owner,string $role='cashier'): User
    {
        $user=User::factory()->create(['role'=>$role]);
        OwnerStaff::create(['user_id'=>$user->id,'owner_id'=>$owner->id,'created_by'=>$owner->user_id]);
        return $user;
    }
    private function paymentData(): array
    {
        return ['contract_id'=>$this->ca->id,'amount'=>'1234.56','date'=>'2026-09-12','type'=>'rent','mode'=>'cash','remarks'=>'RBAC verification','idempotency_key'=>(string)Str::uuid()];
    }
    private function job(Owner $owner,User $tech): Job
    {
        $contract=$owner->id===$this->a->id?$this->ca:$this->cb;
        $complaint=Complaint::factory()->create(['unit_id'=>$contract->unit_id,'tenant_id'=>$contract->tenant_id,'status'=>'assigned','assigned_to'=>$tech->id]);
        return Job::factory()->create(['complaint_id'=>$complaint->id,'assigned_to'=>$tech->id,'assigned_by'=>$owner->user_id,'status'=>'assigned','completed_at'=>null]);
    }
    public function test_owner_scope_uses_profile_id_and_admin_sees_all(): void
    {
        $this->assertNotEquals($this->a->id,$this->a->user_id);
        $this->actingAs($this->a->user)->getJson('/api/owner/dashboard/properties')->assertOk()->assertJsonCount(1,'data.properties');
        $this->getJson('/api/owner/dashboard/properties/'.$this->cb->unit->property_id.'/units')->assertForbidden();
        $this->actingAs($this->adminUser())->getJson('/api/admin/properties')->assertOk();
        $missing=User::factory()->create(['role'=>'owner']);
        $this->actingAs($missing)->getJson('/api/owner/dashboard/properties')->assertForbidden();
    }

    public function test_owner_registration_creates_profile_and_staff_roles_cannot_self_register(): void
    {
        $payload=['name'=>'Registered owner','email'=>'rbac.registered@example.test','password'=>'Registration!123','password_confirmation'=>'Registration!123','role'=>'owner','recaptcha_token'=>'test'];
        $r=$this->postJson('/api/auth/register',$payload)->assertCreated();
        $this->assertDatabaseHas('owners',['user_id'=>$r->json('data.user.id')]);
        $this->assertNotNull($r->json('data.user.owner_scope_id'));
        foreach(['maintenance','cashier','accountant','admin'] as $role) {
            $this->postJson('/api/auth/register',array_replace($payload,['email'=>$role.'.register@example.test','role'=>$role]))->assertUnprocessable();
        }
    }

    public function test_accountant_can_record_and_role_change_revokes_tokens(): void
    {
        $staff=$this->staff($this->a,'accountant');
        $this->actingAs($staff)->postJson('/api/staff/finance/payments',$this->paymentData())->assertCreated();
        \App\Models\User::findOrFail($staff->id)->createToken('existing-login');
        $this->actingAs($this->a->user)->patchJson('/api/owner/staff/'.$staff->staffMembership->id,['role'=>'cashier'])->assertOk();
        $this->assertDatabaseMissing('personal_access_tokens',['tokenable_id'=>$staff->id]);
        $this->actingAs($staff)->getJson('/api/staff/finance/ledger')->assertForbidden();
    }

    public function test_expired_revoked_and_disabled_invitations_cannot_activate(): void
    {
        foreach(['expired','revoked','disabled'] as $case) {
            $staff=$this->staff($this->a);
            $staff->forceFill(['account_status'=>$case==='disabled'?'disabled':'pending'])->save();
            $raw=Str::random(64);
            StaffInvitation::create(['owner_staff_id'=>$staff->staffMembership->id,'token_hash'=>hash('sha256',$raw),'expires_at'=>$case==='expired'?now()->subMinute():now()->addHour(),'revoked_at'=>$case==='revoked'?now():null,'created_by'=>$this->a->user_id]);
            $this->postJson('/api/auth/staff-invitations/accept',['token'=>$raw,'password'=>'Testing!1234','password_confirmation'=>'Testing!1234'])->assertUnprocessable();
            $this->assertNotSame('active',$staff->fresh()->account_status);
        }
    }

    public function test_payment_failure_rolls_back_payment_and_credit(): void
    {
        $staff=$this->staff($this->a);
        $event='eloquent.creating: '.RentTransaction::class;
        \Illuminate\Support\Facades\Event::listen($event, function () { throw new \RuntimeException('Injected ledger failure'); });
        try {
            $this->actingAs($staff)->postJson('/api/staff/finance/payments',$this->paymentData())->assertStatus(500);
            $this->assertDatabaseCount('payments',0);
            $this->assertDatabaseCount('rent_transactions',0);
            $this->assertDatabaseCount('staff_payment_requests',0);
        } finally { \Illuminate\Support\Facades\Event::forget($event); }
    }
    public function test_owner_creates_all_roles_without_password_or_privilege_escalation(): void
    {
        Notification::fake();
        foreach(['cashier','accountant','maintenance'] as $role){
            $r=$this->actingAs($this->a->user)->postJson('/api/owner/staff',['name'=>'New '.$role,'email'=>$role.'@example.test','role'=>$role])->assertCreated()->assertJsonPath('data.staff.account_status','pending');
            $id=$r->json('data.staff.user_id');
            $this->assertDatabaseHas('owner_staff',['user_id'=>$id,'owner_id'=>$this->a->id]);
            $this->assertArrayNotHasKey('password',$r->json('data.staff'));
            Notification::assertSentTo(User::find($id),StaffInvitationNotification::class);
        }
        foreach(['admin','owner','tenant'] as $role)$this->postJson('/api/owner/staff',['name'=>'Invalid','email'=>$role.'@example.test','role'=>$role])->assertUnprocessable();
        $this->postJson('/api/owner/staff',['name'=>'Forged','email'=>'forged@example.test','role'=>'cashier','owner_id'=>$this->b->id])->assertUnprocessable();
    }
    public function test_staff_activation_is_single_use_and_disabled_account_cannot_activate(): void
    {
        $staff=$this->staff($this->a);
        $staff->forceFill(['account_status'=>'pending'])->save();
        $raw=Str::random(64);
        StaffInvitation::create(['owner_staff_id'=>$staff->staffMembership->id,'token_hash'=>hash('sha256',$raw),'expires_at'=>now()->addHour(),'created_by'=>$this->a->user_id]);
        $payload=['token'=>$raw,'password'=>'TestActivation!123','password_confirmation'=>'TestActivation!123'];
        $this->postJson('/api/auth/staff-invitations/accept',$payload)->assertOk();
        $this->assertDatabaseHas('users',['id'=>$staff->id,'account_status'=>'active']);
        $this->postJson('/api/auth/staff-invitations/accept',$payload)->assertUnprocessable();
        $this->postJson('/api/auth/login',['email'=>$staff->email,'password'=>'TestActivation!123'])->assertOk()->assertJsonPath('data.user.role','cashier');
    }
    public function test_cross_owner_staff_management_and_finance_actions_are_denied(): void
    {
        $cashier=$this->staff($this->a);
        $other=$this->staff($this->b);
        $id=$other->staffMembership->id;
        $this->actingAs($this->a->user)->getJson('/api/owner/staff/'.$id)->assertNotFound();
        $this->patchJson('/api/owner/staff/'.$id,['name'=>'Unauthorized'])->assertNotFound();
        $this->postJson('/api/owner/staff/'.$id.'/disable',['reason'=>'No'])->assertNotFound();
        $this->actingAs($cashier)->getJson('/api/owner/staff')->assertForbidden();
        $this->getJson('/api/admin/payments')->assertForbidden();
        $this->getJson('/api/staff/finance/ledger')->assertForbidden();
        $this->getJson('/api/staff/finance/contracts')->assertOk()->assertJsonCount(1,'data.contracts')->assertJsonPath('data.contracts.0.id',$this->ca->id);
        $this->postJson('/api/staff/finance/payments',array_replace($this->paymentData(),['contract_id'=>$this->cb->id]))->assertNotFound();
        $this->assertDatabaseCount('payments',0);
    }
    public function test_payment_is_atomic_idempotent_and_visible_to_accountant_and_owner(): void
    {
        $cashier=$this->staff($this->a);
        $accountant=$this->staff($this->a,'accountant');
        $data=$this->paymentData();
        $r=$this->actingAs($cashier)->postJson('/api/staff/finance/payments',$data)->assertCreated();
        $id=$r->json('data.payment.id');
        $this->assertDatabaseHas('payments',['id'=>$id,'tenant_id'=>$this->ca->tenant_id,'recorded_by'=>$cashier->id,'amount'=>'1234.56']);
        $this->assertDatabaseHas('rent_transactions',['payment_id'=>$id,'credit'=>'1234.56']);
        $this->postJson('/api/staff/finance/payments',$data)->assertOk()->assertJsonPath('data.replayed',true);
        $this->postJson('/api/staff/finance/payments',array_replace($data,['amount'=>'1235.56']))->assertConflict();
        $this->assertDatabaseCount('payments',1);
        $this->assertSame(1,RentTransaction::where('payment_id',$id)->count());
        $this->actingAs($accountant)->getJson('/api/staff/finance/payments')->assertOk()->assertJsonPath('data.payments.data.0.id',$id);
        $this->getJson('/api/staff/finance/ledger')->assertOk()->assertJsonCount(1,'data.entries.data');
        $receipt=$this->get('/api/staff/finance/payments/'.$id.'/receipt')->assertOk();
        $this->assertStringStartsWith('%PDF',$receipt->getContent());
        $this->actingAs($this->a->user)->getJson('/api/owner/finance/payments')->assertOk()->assertJsonPath('data.payments.0.id',$id);
        $this->actingAs($this->staff($this->b))->getJson('/api/staff/finance/payments/'.$id)->assertNotFound();
        $this->get('/api/staff/finance/payments/'.$id.'/receipt')->assertNotFound();
    }
    public function test_payment_validation_and_unresolved_ownership_fail_without_writes(): void
    {
        $this->actingAs($this->staff($this->a));
        foreach([['amount'=>'0'],['amount'=>'2.333'],['tenant_id'=>$this->cb->tenant_id],['recorded_by'=>1],['owner_id'=>$this->b->id]] as $invalid){
            $this->postJson('/api/staff/finance/payments',array_replace($this->paymentData(),$invalid))->assertUnprocessable();
        }
        $this->ca->update(['owner_id'=>$this->b->id]);
        $this->postJson('/api/staff/finance/payments',$this->paymentData())->assertNotFound();
        $this->assertDatabaseCount('payments',0);
        $this->assertDatabaseCount('rent_transactions',0);
    }
    public function test_disabled_staff_and_owner_block_existing_sessions(): void
    {
        $staff=$this->staff($this->a);
        $staff->createToken('canonical');
        \App\Models\User::findOrFail($staff->id)->createToken('legacy-alias');
        $this->actingAs($this->a->user)->postJson('/api/owner/staff/'.$staff->staffMembership->id.'/disable',['reason'=>'Verification'])->assertOk();
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id'=>$staff->id]);
        $this->actingAs($staff)->getJson('/api/staff/finance/payments')->assertForbidden();
        $staff->forceFill(['account_status'=>'active'])->save();
        $this->a->user->forceFill(['account_status'=>'disabled'])->save();
        $this->actingAs($staff)->getJson('/api/staff/finance/summary')->assertForbidden();
    }
    public function test_maintenance_cannot_claim_unassigned_or_other_owner_work(): void
    {
        $tech=$this->staff($this->a,'maintenance');
        $colleague=$this->staff($this->a,'maintenance');
        $other=$this->staff($this->b,'maintenance');
        $own=$this->job($this->a,$tech);
        $same=$this->job($this->a,$colleague);
        $foreign=$this->job($this->b,$other);
        Complaint::factory()->create(['unit_id'=>$this->cb->unit_id,'tenant_id'=>$this->cb->tenant_id,'status'=>'open']);
        $this->actingAs($tech)->getJson('/api/maintenance/jobs')->assertOk()->assertJsonCount(1,'data.jobs.data');
        $this->getJson('/api/maintenance/complaints')->assertOk()->assertJsonCount(1,'data.complaints');
        foreach([$same,$foreign] as $job){
            $this->getJson('/api/maintenance/jobs/'.$job->id)->assertNotFound();
            $this->postJson('/api/maintenance/jobs/'.$job->id.'/status',['status'=>'in_progress'])->assertNotFound();
            $this->postJson('/api/maintenance/complaints/'.$job->complaint_id.'/status',['status'=>'in_progress'])->assertNotFound();
        }
        $this->getJson('/api/maintenance/daily-report')->assertOk()->assertJsonPath('data.stats.open',0)->assertJsonPath('data.stats.assigned',1);
        $this->getJson('/api/staff/finance/payments')->assertForbidden();
        $this->assertSame('assigned',$own->fresh()->status);
    }
    public function test_job_completion_transitions_sync_once_and_reassignment_revokes_access(): void
    {
        $tech=$this->staff($this->a,'maintenance');
        $job=$this->job($this->a,$tech);
        $this->actingAs($this->adminUser())->getJson('/api/admin/jobs/'.$job->id)
            ->assertOk()->assertJsonPath('data.job.assigned_to', $tech->id)
            ->assertJsonPath('data.job.assignedTo.id', $tech->id);
        $this->actingAs($tech)->postJson('/api/maintenance/jobs/'.$job->id.'/status',['status'=>'completed'])->assertConflict();
        $this->postJson('/api/maintenance/jobs/'.$job->id.'/status',['status'=>'in_progress','notes'=>'Started'])->assertOk();
        $this->postJson('/api/maintenance/jobs/'.$job->id.'/status',['status'=>'completed','notes'=>'Repaired'])->assertOk();
        $time=$job->fresh()->completed_at;
        $this->postJson('/api/maintenance/jobs/'.$job->id.'/status',['status'=>'completed'])->assertOk();
        $this->assertEquals($time,$job->fresh()->completed_at);
        $this->assertSame('resolved',$job->complaint->fresh()->status);
        $other=$this->staff($this->a,'maintenance');
        $this->actingAs($this->adminUser())->putJson('/api/admin/jobs/'.$job->id,['assigned_to'=>$other->id,'status'=>'assigned'])->assertOk();
        $this->actingAs($tech)->postJson('/api/maintenance/jobs/'.$job->id.'/status',['status'=>'in_progress'])->assertNotFound();
    }
    public function test_totals_include_more_than_two_hundred_rows_and_exclude_other_owner(): void
    {
        for($i=0;$i<205;$i++) Payment::create(['contract_id'=>$this->ca->id,'tenant_id'=>$this->ca->tenant_id,'type'=>'rent','mode'=>'cash','amount'=>'1.25','date'=>'2026-09-12','recorded_by'=>$this->a->user_id]);
        Payment::create(['contract_id'=>$this->cb->id,'tenant_id'=>$this->cb->tenant_id,'type'=>'rent','mode'=>'cash','amount'=>'999','date'=>'2026-09-12','recorded_by'=>$this->b->user_id]);
        $this->actingAs($this->staff($this->a))->getJson('/api/staff/finance/summary')->assertOk()->assertJsonPath('data.collections','256.25')->assertJsonPath('data.payment_count',205);
        $r=$this->actingAs($this->a->user)->getJson('/api/owner/finance/payments')->assertOk()->assertJsonCount(200,'data.payments');
        $this->assertEquals(256.25,$r->json('data.total_amount'));
    }

    public function test_duplicate_historical_jobs_require_review_without_changing_complaint(): void
    {
        $tech=$this->staff($this->a,'maintenance');
        $job=$this->job($this->a,$tech);
        Job::factory()->create(['complaint_id'=>$job->complaint_id,'assigned_to'=>$tech->id,'status'=>'assigned']);
        $this->actingAs($tech)->postJson('/api/maintenance/jobs/'.$job->id.'/status',['status'=>'in_progress'])->assertConflict();
        $this->assertSame('assigned',$job->fresh()->status);
        $this->assertSame('assigned',$job->complaint->fresh()->status);
        $this->actingAs($this->adminUser())->postJson('/api/admin/jobs',['complaint_id'=>$job->complaint_id,'assigned_to'=>$tech->id])->assertConflict();
        $this->assertSame(2,Job::where('complaint_id',$job->complaint_id)->count());
    }

    public function test_tenant_complaint_submission_requires_its_own_active_contract(): void
    {
        $tenantUser=User::factory()->create(['role'=>'tenant']);
        $this->ca->tenant->update(['user_id'=>$tenantUser->id]);
        $this->ca->update(['status'=>'active']);
        $payload=['unit_id'=>$this->cb->unit_id,'title'=>'Tenant scope check','description'=>'Only my contracted unit','priority'=>'medium'];
        $this->actingAs($tenantUser)->postJson('/api/tenant/complaints',$payload)->assertUnprocessable();
        $this->assertDatabaseCount('complaints',0);
        $payload['unit_id']=$this->ca->unit_id;
        $this->postJson('/api/tenant/complaints',$payload)->assertCreated();
        $this->assertDatabaseHas('complaints',['unit_id'=>$this->ca->unit_id,'tenant_id'=>$this->ca->tenant_id]);
        $this->ca->update(['status'=>'vacated']);
        $this->postJson('/api/tenant/complaints',$payload)->assertUnprocessable();
        $missing=User::factory()->create(['role'=>'tenant']);
        $this->actingAs($missing)->postJson('/api/tenant/complaints',$payload)->assertForbidden();
        $this->getJson('/api/tenant/complaints')->assertOk()->assertJsonCount(0,'data.complaints');
        $this->assertDatabaseCount('complaints',1);
    }
}

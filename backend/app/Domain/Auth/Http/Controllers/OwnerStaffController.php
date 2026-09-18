<?php
namespace App\Domain\Auth\Http\Controllers;

use App\Domain\Auth\Models\OwnerStaff;
use App\Domain\Auth\Services\{OwnerContextResolver, StaffAccountService};
use App\Domain\Maintenance\Models\Job;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OwnerStaffController extends Controller
{
    public function __construct(private OwnerContextResolver $context, private StaffAccountService $service) {}

    private function member(Request $r, int $id): OwnerStaff
    {
        return OwnerStaff::where('owner_id', $this->context->ownerId($r->user()))->findOrFail($id);
    }

    private function row(OwnerStaff $staff): array
    {
        $user = $staff->user()->firstOrFail();
        $invite = $staff->invitations()->latest('id')->first();
        return ['id' => $staff->id, 'user_id' => $user->id, 'name' => $user->name, 'email' => $user->email,
            'role' => $user->role, 'account_status' => $user->account_status,
            'invitation_status' => $invite?->accepted_at ? 'accepted' : ($invite?->revoked_at ? 'revoked' : ($invite?->expires_at?->isPast() ? 'expired' : ($invite?->delivery_status ?? 'none'))),
            'unfinished_jobs' => Job::where('assigned_to', $user->id)->where('status', '!=', 'completed')->count()];
    }

    public function index(Request $r)
    {
        $r->validate(['role' => ['nullable', Rule::in(OwnerContextResolver::STAFF_ROLES)], 'status' => 'nullable|in:active,pending,disabled', 'search' => 'nullable|string|max:100']);
        $q = OwnerStaff::where('owner_id', $this->context->ownerId($r->user()));
        $q->whereHas('user', function ($u) use ($r) {
            if ($r->filled('role')) $u->where('role', $r->role);
            if ($r->filled('status')) $u->where('account_status', $r->status);
            if ($r->filled('search')) $u->where(fn ($s) => $s->where('name', 'like', '%'.$r->search.'%')->orWhere('email', 'like', '%'.$r->search.'%'));
        });
        $page = $q->latest('id')->paginate(25);
        return response()->json(['data' => ['staff' => $page->getCollection()->map(fn ($s) => $this->row($s)), 'total' => $page->total(), 'last_page' => $page->lastPage()]]);
    }

    public function store(Request $r)
    {
        $data = $r->validate(['name' => 'required|string|max:255', 'email' => 'required|email|max:255|unique:users,email',
            'role' => ['required', Rule::in(OwnerContextResolver::STAFF_ROLES)], 'owner_id' => 'prohibited', 'user_id' => 'prohibited', 'password' => 'prohibited', 'account_status' => 'prohibited']);
        $staff = $this->service->create($r->user(), $data);
        return response()->json(['data' => ['staff' => $this->row($staff)]], 201);
    }

    public function show(Request $r, int $staff) { return response()->json(['data' => ['staff' => $this->row($this->member($r, $staff))]]); }
    public function update(Request $r, int $staff)
    {
        $member = $this->member($r, $staff);
        $data = $r->validate(['name' => 'sometimes|required|string|max:255', 'role' => ['sometimes', 'required', Rule::in(OwnerContextResolver::STAFF_ROLES)], 'email' => 'prohibited', 'owner_id' => 'prohibited', 'account_status' => 'prohibited']);
        $this->service->update($r->user(), $member, $data);
        return response()->json(['data' => ['staff' => $this->row($member)]]);
    }
    public function disable(Request $r, int $staff) { return $this->changeStatus($r, $staff, false); }
    public function enable(Request $r, int $staff) { return $this->changeStatus($r, $staff, true); }
    private function changeStatus(Request $r, int $staff, bool $enable)
    {
        $member = $this->member($r, $staff);
        $data = $r->validate(['reason' => ($enable ? 'nullable' : 'required').'|string|max:500']);
        $this->service->status($r->user(), $member, $enable, $data['reason'] ?? null);
        return response()->json(['data' => ['staff' => $this->row($member)]]);
    }
    public function invite(Request $r, int $staff)
    {
        $member = $this->member($r, $staff);
        $this->service->invite($r->user(), $member);
        return response()->json(['data' => ['staff' => $this->row($member)]]);
    }
    public function accept(Request $r)
    {
        $data = $r->validate(['token' => 'required|string|size:64', 'password' => 'required|string|min:8|max:255|confirmed']);
        $this->service->accept($data['token'], $data['password']);
        return response()->json(['message' => 'Account activated. Please sign in.']);
    }
}

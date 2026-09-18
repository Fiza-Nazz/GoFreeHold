<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Maintenance\Models\Job;
use App\Domain\Maintenance\Services\MaintenanceStatusService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StaffJobController extends Controller
{
    private function query(Request $r)
    {
        return app(OwnerContextResolver::class)->jobs(Job::query(), $r->user())->with([
            'complaint:id,unit_id,title,description,priority,status', 'complaint.unit:id,number,property_id',
            'complaint.unit.property:id,name,address,city']);
    }
    public function index(Request $r)
    {
        $r->validate(['status' => 'nullable|in:assigned,in_progress,completed', 'page' => 'nullable|integer|min:1']);
        $q = $this->query($r);
        $counts = (clone $q)->select('status')->selectRaw('COUNT(*) as total')->groupBy('status')->pluck('total','status');
        if ($r->filled('status')) $q->where('status', $r->status);
        return response()->json(['data' => ['jobs' => $q->latest('id')->paginate(25), 'counts' => $counts]]);
    }
    public function show(Request $r, int $job) { return response()->json(['data' => ['job' => $this->query($r)->findOrFail($job)]]); }
    public function status(Request $r, int $job)
    {
        $data = $r->validate(['status' => 'required|in:assigned,in_progress,completed', 'notes' => 'nullable|string|max:4000', 'assigned_to' => 'prohibited', 'owner_id' => 'prohibited']);
        $record = $this->query($r)->findOrFail($job);
        app(MaintenanceStatusService::class)->updateJob($record, $data, $r->user()->id);
        return $this->show($r, $job);
    }
}

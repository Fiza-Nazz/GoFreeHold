<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Maintenance\Models\Job;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MaintenanceReportController extends Controller
{
    /**
     * Daily maintenance reporting and completion statistics
     */
    public function dailyReport(Request $request)
    {
        $request->validate(['date' => 'nullable|date_format:Y-m-d']);
        $complaints = Complaint::query();
        $jobs = Job::query();
        if ($request->user()->role === 'maintenance') {
            $context = app(\App\Domain\Auth\Services\OwnerContextResolver::class);
            $context->jobs($jobs, $request->user());
            $complaints->whereHas('job', fn ($j) => $context->jobs($j, $request->user()));
        }
        $date = $request->query('date', Carbon::today()->toDateString());

        // Live complaints table has no resolved_at — resolution date lives on jobs.completed_at
        // (set when a complaint is marked resolved; see ComplaintController::updateStatus).
        $totalOpen = (clone $complaints)->where('status', 'open')->count();
        $totalAssigned = (clone $complaints)->where('status', 'assigned')->count();
        $totalInProgress = (clone $complaints)->where('status', 'in_progress')->count();
        $totalResolvedToday = (clone $jobs)->whereDate('completed_at', $date)->count();

        $completedJobsToday = (clone $jobs)->with(['complaint:id,unit_id,title', 'complaint.unit:id,number,property_id', 'complaint.unit.property:id,name', 'assignedTo:id,name'])
            ->whereDate('completed_at', $date)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'report_date' => $date,
                'stats'       => [
                    'open'           => $totalOpen,
                    'assigned'       => $totalAssigned,
                    'in_progress'    => $totalInProgress,
                    'resolved_today' => $totalResolvedToday,
                ],
                'completed_jobs' => $completedJobsToday,
            ],
        ]);
    }
}

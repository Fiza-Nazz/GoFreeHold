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
        $date = $request->query('date', Carbon::today()->toDateString());

        // Live complaints table has no resolved_at — resolution date lives on jobs.completed_at
        // (set when a complaint is marked resolved; see ComplaintController::updateStatus).
        $totalOpen = Complaint::where('status', 'open')->count();
        $totalAssigned = Complaint::where('status', 'assigned')->count();
        $totalInProgress = Complaint::where('status', 'in_progress')->count();
        $totalResolvedToday = Job::whereDate('completed_at', $date)->count();

        $completedJobsToday = Job::with(['complaint.unit.property', 'assignedTo:id,name'])
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

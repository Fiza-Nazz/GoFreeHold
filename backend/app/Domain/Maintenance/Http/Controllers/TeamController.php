<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::withCount('jobs')->get();
        return response()->json(['status' => 'success', 'data' => ['teams' => $teams]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'phone'  => 'nullable|string|max:50',
            'remark' => 'nullable|string',
        ]);

        $team = Team::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Team created.', 'data' => ['team' => $team]], 201);
    }

    public function show(Team $team)
    {
        $team->load('jobs.complaint:id,title,status');
        return response()->json(['status' => 'success', 'data' => ['team' => $team]]);
    }

    public function update(Request $request, Team $team)
    {
        $validated = $request->validate([
            'name'   => 'string|max:255',
            'phone'  => 'nullable|string|max:50',
            'remark' => 'nullable|string',
        ]);

        $team->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Team updated.', 'data' => ['team' => $team]]);
    }

    public function destroy(Team $team)
    {
        $team->delete();
        return response()->json(['status' => 'success', 'message' => 'Team deleted.']);
    }
}

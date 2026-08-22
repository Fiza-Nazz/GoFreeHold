<?php

namespace App\Models;

/**
 * Backward-compatible alias — canonical model lives in Domain\Auth.
 * Keeps existing module imports (App\Models\User) working after DDD move.
 */
class User extends \App\Domain\Auth\Models\User
{
}

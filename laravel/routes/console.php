<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('rules:evaluate')->everyFifteenMinutes();
Schedule::command('campaigns:sync')->hourly();

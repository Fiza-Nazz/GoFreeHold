<?php

use App\Domain\Auth\Providers\AuthServiceProvider;
use App\Domain\Contract\Providers\ContractServiceProvider;
use App\Domain\Dashboard\Providers\DashboardServiceProvider;
use App\Domain\Maintenance\Providers\MaintenanceServiceProvider;
use App\Domain\Payment\Providers\PaymentServiceProvider;
use App\Domain\Property\Providers\PropertyServiceProvider;
use App\Domain\Report\Providers\ReportServiceProvider;
use App\Domain\Settlement\Providers\SettlementServiceProvider;
use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    AuthServiceProvider::class,
    DashboardServiceProvider::class,
    PropertyServiceProvider::class,
    ContractServiceProvider::class,
    PaymentServiceProvider::class,
    SettlementServiceProvider::class,
    MaintenanceServiceProvider::class,
    ReportServiceProvider::class,
];

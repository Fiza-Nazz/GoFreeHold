param([int]$Port = 8000)

# Keep PHP's transport limit above the application's 5MB attachment limit.
Push-Location (Join-Path $PSScriptRoot 'public')
try {
    php -d upload_max_filesize=6M -d post_max_size=8M -S "127.0.0.1:$Port" ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
} finally {
    Pop-Location
}

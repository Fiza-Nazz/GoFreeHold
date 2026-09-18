<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Reset your password</title></head>
<body>
    <p>A password reset was requested for your account.</p>
    <p><a href="{{ $resetUrl }}">Reset your password</a></p>
    <p>This link expires in {{ $expires }} minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
</body>
</html>

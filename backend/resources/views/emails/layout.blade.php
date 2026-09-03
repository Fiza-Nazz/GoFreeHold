<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ $title ?? 'GoFreeHold System Alert' }}</title>
  <style>
    body, table, td, p, a, li {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #F4F1FA;
      color: #1A1423;
    }
  </style>
</head>
<body style="margin: 0; padding: 30px 10px; background-color: #F4F1FA;">
  <center>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; background-color: #FFFFFF; border: 1px solid #E5DEF5; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(36, 0, 70, 0.08); text-align: left;">
      <!-- BRAND HEADER -->
      <tr>
        <td style="background: linear-gradient(135deg, #18002E 0%, #240046 55%, #3C096C 100%); padding: 26px 32px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td>
                <div style="font-size: 24px; font-weight: 800; letter-spacing: 0.5px; color: #FFFFFF; text-transform: uppercase;">
                  GoFreeHold
                </div>
                <div style="font-size: 11px; font-weight: 600; letter-spacing: 1px; color: #E0AAFF; text-transform: uppercase; margin-top: 4px;">
                  Real Estate Management &bull; Automated Watchdog
                </div>
              </td>
              <td align="right">
                <span style="display: inline-block; background-color: rgba(224, 170, 255, 0.18); border: 1px solid #9D4EDD; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.6px;">
                  System Alert
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BODY CONTENT -->
      <tr>
        <td style="padding: 32px 32px 24px 32px;">
          @yield('content')
        </td>
      </tr>

      <!-- CTA ACTION BUTTON -->
      <tr>
        <td style="padding: 0 32px 30px 32px; text-align: center;">
          <a href="http://localhost:5173/admin/settings" style="display: inline-block; background-color: #240046; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase;">
            Open Admin Portal &rarr;
          </a>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background-color: #FAF8FD; border-top: 1px solid #EEE9F8; padding: 22px 32px; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #5C4D7D;">
            GoFreeHold Automated Notification Scheduler
          </p>
          <p style="margin: 0; font-size: 11px; color: #8F82A8;">
            This is an automated operational dispatch. Dubai, UAE &bull; Confidential &amp; Proprietary
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>

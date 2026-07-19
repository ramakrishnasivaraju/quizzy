@echo off
echo Starting Smart Campus Project...

:: Move into the server directory
cd /d "%~dp0server"

:: Start the Node.js server in a minimized window
start "" /min node app.js

echo Server started. Opening Dashboard...

:: Open the admin dashboard in your default browser
:: Replace this path with the full path to your admin-dashboard.html file
start "" "file:///C:/Users/krish/OneDrive/Desktop/project2/client/pages/admin-dashboard.html"

echo Project is running. You can close this window.
exit
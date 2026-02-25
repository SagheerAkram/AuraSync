Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class Win32 {
    [DllImport("user32.dll")]
    public static short GetAsyncKeyState(int vKey);
}
"@

$VK_CONTROL = 0x11
$VK_MENU = 0x12 # ALT Key
$VK_LEFT = 0x25
$VK_UP = 0x26
$VK_RIGHT = 0x27
$VK_J = 0x4A

Write-Host "AuraSync Hotkey Listener Active..."

while ($true) {
    if ([Win32]::GetAsyncKeyState($VK_CONTROL) -band 0x8000 -and [Win32]::GetAsyncKeyState($VK_MENU) -band 0x8000) {
        
        if ([Win32]::GetAsyncKeyState($VK_RIGHT) -band 0x8000) {
            Write-Output "HOTKEY:NEXT"
            Start-Sleep -Milliseconds 300
        }
        elseif ([Win32]::GetAsyncKeyState($VK_LEFT) -band 0x8000) {
            Write-Output "HOTKEY:PREV"
            Start-Sleep -Milliseconds 300
        }
        elseif ([Win32]::GetAsyncKeyState($VK_UP) -band 0x8000) {
            Write-Output "HOTKEY:TOGGLE"
            Start-Sleep -Milliseconds 300
        }
        elseif ([Win32]::GetAsyncKeyState($VK_J) -band 0x8000) {
            Write-Output "HOTKEY:JUMP"
            Start-Sleep -Milliseconds 500
        }
    }
    Start-Sleep -Milliseconds 100
}

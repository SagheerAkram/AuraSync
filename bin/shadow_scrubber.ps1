Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class Win32 {
    [DllImport("user32.dll")]
    public static extern short GetAsyncKeyState(int vKey);
    
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }
}
"@

$SEEK_FILE = Join-Path $PSScriptRoot "..\.seek_signal"
$lastState = 0

Write-Host "Shadow Scrubber Active. Monitoring Spotify..."

while ($true) {
    $state = [Win32]::GetAsyncKeyState(0x01) # Left Mouse Button
    
    if (($state -band 0x8000) -and (-not ($lastState -band 0x8000))) {
        $hWnd = [Win32]::GetForegroundWindow()
        $sb = New-Object System.Text.StringBuilder 256
        [Win32]::GetWindowText($hWnd, $sb, 256)
        $title = $sb.ToString()

        if ($title -like "*Spotify*") {
            $rect = New-Object Win32+RECT
            if ([Win32]::GetWindowRect($hWnd, [ref]$rect)) {
                $pos = [System.Windows.Forms.Cursor]::Position
                
                $width = $rect.Right - $rect.Left
                $height = $rect.Bottom - $rect.Top
                
                # Spotify Playback bar is usually in the bottom ~100 pixels
                # The scrubber is typically centered horizontally
                $relX = $pos.X - $rect.Left
                $relY = $pos.Y - $rect.Top
                
                # Heuristic: If click is in the bottom 10% of the window and vertically centered-ish
                if ($relY -gt ($height - 100) -and $relX -gt ($width * 0.2) -and $relX -lt ($width * 0.8)) {
                    # Calculate percentage based on the typical scrubber width (roughly 40% to 60% center)
                    # Let's be more precise: Scrubber is usually a large horizontal bar.
                    # We'll map the middle 60% of the window width to 0-100% of the track
                    $scrubberStart = $width * 0.25
                    $scrubberEnd = $width * 0.75
                    $scrubberWidth = $scrubberEnd - $scrubberStart
                    
                    if ($relX -ge $scrubberStart -and $relX -le $scrubberEnd) {
                        $percent = ($relX - $scrubberStart) / $scrubberWidth
                        if ($percent -lt 0) { $percent = 0 }
                        if ($percent -gt 1) { $percent = 1 }
                        
                        $percentString = [Math]::Round($percent, 4).ToString()
                        $percentString | Out-File -FilePath $SEEK_FILE -Encoding ascii
                        Write-Host "Seek Signal: $percentString"
                    }
                }
            }
        }
    }
    
    $lastState = $state
    Start-Sleep -Milliseconds 100
}

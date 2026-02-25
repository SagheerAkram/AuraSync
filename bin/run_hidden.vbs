Set WshShell = CreateObject("WScript.Shell")
' Run the batch file in the bin folder without showing a window
WshShell.Run chr(34) & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\start.bat" & Chr(34), 0
Set WshShell = Nothing

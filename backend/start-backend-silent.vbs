Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Change to backend directory
WshShell.CurrentDirectory = strScriptPath

' Create logs directory if it doesn't exist
strLogsPath = strScriptPath & "\logs"
If Not objFSO.FolderExists(strLogsPath) Then
    objFSO.CreateFolder(strLogsPath)
End If

' Log file path
strLogFile = strLogsPath & "\startup.log"

' Get current timestamp
strTimestamp = Now()

' Write startup log
Set objLogFile = objFSO.OpenTextFile(strLogFile, 8, True)
objLogFile.WriteLine(strTimestamp & " - Starting Dennp POS Backend...")
objLogFile.Close

' Start Node.js server silently (no window shown)
' 0 = Hide window, True = Wait for completion (False = don't wait)
WshShell.Run "cmd /c npm run start >> """ & strLogsPath & "\backend.log"" 2>&1", 0, False

' Write success log
Set objLogFile = objFSO.OpenTextFile(strLogFile, 8, True)
objLogFile.WriteLine(strTimestamp & " - Backend started successfully (silent mode)")
objLogFile.Close

Set WshShell = Nothing
Set objFSO = Nothing

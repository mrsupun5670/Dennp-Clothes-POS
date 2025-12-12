' VBScript to start backend silently (no window)
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c ""C:\Program Files\Dennep Clothes POS\start-backend.bat""", 0, False
Set WshShell = Nothing

Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd ""C:\Program Files\Dennp Clothes POS\backend"" && npm start", 0, False
Set WshShell = Nothing
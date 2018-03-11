@ECHO OFF        ;这个命令可以省略，用来隐藏屏幕输出
@DEL /F /A /Q \\?\%1  
@RD /S /Q \\?\%1
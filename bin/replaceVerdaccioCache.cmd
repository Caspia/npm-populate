::
:: This is a DOS batch file to replace the verdaccio cache on a running linux virtualbox
:: with a new file
::
:: R. Kent James 2018-04-20
::
:: Repository: https://github.com/Caspia/npm-populate
::
:: Usage: This batch file must be run from a DOS command prompt with administrator privileges.
::
:: replaceCache VMNAME NEWFILE
::
@echo off
echo %~1 %~2 %~3 %~4 %~5
setlocal
set VM_NAME=%~1
set FILE_NAME=%~2
if [%VM_NAME%]==[] goto :usage
if [%FILE_NAME%==[] goto :usage
if NOT EXIST %FILE_NAME% goto :badfile
set VBOXMANAGE="c:\Program Files\Oracle\VirtualBox\VBoxManage.exe"
@echo on
:: Stop the VM so that we can modify settings
net stop VBoxVmService
:: Detach anything on port 1 of the vm, which is where the verdaccio cache should be attached
%VBOXMANAGE% storageattach %VM_NAME% --storagectl SCSI --port 1 --device 0 --type hdd --medium none
:: Remove any previous reference to the new disk
%VBOXMANAGE% closemedium %FILE_NAME%
:: Attach the new file to the VM on port 1
%VBOXMANAGE% storageattach %VM_NAME% --storagectl SCSI --port 1 --device 0 --type hdd --medium %FILE_NAME%
:: restart the VM
net start VBoxVmService
exit /b

:badfile
echo File %FILE_NAME% not found
:: fall through to :usage

:usage
echo Usage: (running with an administator command prompt):
echo replaceCache VMNAME FILENAME
echo example:
echo replaceCache rancheros6 c:\caspia\verdaccio_20180416.vdi
exit /b


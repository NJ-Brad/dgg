@echo off
:: from https://stackoverflow.com/questions/17063947/get-current-batchfile-directory
:: --HAS ENDING BACKSLASH
set batdir=%~dp0
:: --MISSING ENDING BACKSLASH
:: set batdir=%CD%
pushd "%batdir%"

set startdir=%CD%
pushd "%startdir%"

node %batdir%/out/dgg.js %1 %2 %3 %4 %5 %6

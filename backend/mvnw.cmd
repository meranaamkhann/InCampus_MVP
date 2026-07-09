@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script (classic form - no PowerShell
@REM trickery, so it behaves identically from cmd.exe or PowerShell).
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set ERROR_CODE=0

set MAVEN_PROJECTBASEDIR=%~dp0
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%

set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

if not "%JAVA_HOME%"=="" (
  if exist "%JAVA_HOME%\bin\java.exe" (
    set JAVACMD="%JAVA_HOME%\bin\java.exe"
  )
)
if "%JAVACMD%"=="" (
  set JAVACMD=java.exe
)

where %JAVACMD% >nul 2>nul
if ERRORLEVEL 1 (
  echo.
  echo Error: JAVA_HOME is not set and no 'java' command could be found on your PATH.
  echo Please set the JAVA_HOME environment variable to match the location of your Java installation.
  echo.
  set ERROR_CODE=1
  goto end
)

if not exist %WRAPPER_JAR% (
  echo Downloading Maven Wrapper jar...
  set WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar
  for /f "usebackq tokens=1,* delims==" %%A in (%WRAPPER_PROPERTIES%) do (
    if "%%A"=="wrapperUrl" set WRAPPER_URL=%%B
  )
  powershell -NoProfile -Command "Invoke-WebRequest -Uri '%WRAPPER_URL%' -OutFile %WRAPPER_JAR%"
  if ERRORLEVEL 1 (
    echo.
    echo Failed to download the Maven Wrapper jar from %WRAPPER_URL%
    echo Download it manually and place it at %WRAPPER_JAR%
    echo.
    set ERROR_CODE=1
    goto end
  )
)

%JAVACMD% ^
  %MAVEN_OPTS% ^
  -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" ^
  -classpath %WRAPPER_JAR% ^
  %WRAPPER_LAUNCHER% %*

if ERRORLEVEL 1 set ERROR_CODE=1

:end
endlocal & exit /B %ERROR_CODE%

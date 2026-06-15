@echo off
title GaroFlow - Servidor de Desenvolvimento
echo =================================================================
echo             INICIANDO A PLATAFORMA GAROFLOW
echo =================================================================
echo.
echo [1/2] Iniciando o navegador em http://localhost:3000...
start http://localhost:3000
echo.
echo [2/2] Executando o servidor Next.js...
echo.
npm run dev
pause

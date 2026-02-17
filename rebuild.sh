#!/bin/bash

# Script para rebuildar la aplicación después del fix
# Ejecuta esto desde tu terminal WSL en la raíz del proyecto

echo "============================================"
echo "🔧 Rebuilding GESCOL con el fix aplicado"
echo "============================================"
echo ""

echo "1️⃣  Limpiando builds anteriores..."
rm -rf dist-electron
rm -rf build

echo ""
echo "2️⃣  Building código frontend (Vite)..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build de Vite completado"
else
    echo "❌ Error en build de Vite"
    exit 1
fi

echo ""
echo "3️⃣  Building aplicación Electron para Windows..."
npm run build-electron:win

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "✅ BUILD COMPLETADO EXITOSAMENTE"
    echo "============================================"
    echo ""
    echo "📦 Archivos generados en: dist-electron/"
    echo ""
    echo "Para ejecutar:"
    echo "  Desde Windows PowerShell:"
    echo "    cd \\\\wsl.localhost\\Ubuntu\\home\\knyr\\Projects\\GESCOL-FrontEnd\\dist-electron"
    echo "    .\\GESCOL*.exe"
    echo ""
    echo "O navega con el Explorador de Windows a:"
    echo "  \\\\wsl.localhost\\Ubuntu\\home\\knyr\\Projects\\GESCOL-FrontEnd\\dist-electron"
    echo ""
else
    echo "❌ Error en build de Electron"
    exit 1
fi

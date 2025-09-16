#!/bin/bash

echo "🧹 Nettoyage des processus existants..."

# Kill all existing processes
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "simple_backend.py" 2>/dev/null || true

# Force kill specific ports
lsof -ti:3000,3001,3004,3005,3010,8000,8001 | xargs -I {} kill -9 {} 2>/dev/null || true

echo "⏳ Attente du nettoyage..."
sleep 3

echo "🚀 Démarrage du backend sur le port 8000..."
cd /home/tsec/Documents/SENUM-2025/PROJET-PERSO/WAZUH
python3 simple_backend.py &
BACKEND_PID=$!

echo "⏳ Attente du démarrage backend..."
sleep 5

echo "🎨 Démarrage du frontend sur le port 3000..."
cd /home/tsec/OneDrive/Documents/SENUM-2025/PROJET-PERSO/WAZUH/frontend
npm run dev -- --port 3000 &
FRONTEND_PID=$!

echo ""
echo "✅ Plateforme Wazuh démarrée !"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo ""
echo "📝 PIDs des processus:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "🛑 Pour arrêter la plateforme, utilisez: pkill -f 'npm run dev'; pkill -f 'simple_backend.py'"
echo ""

# Wait for user input to keep script running
echo "Appuyez sur Ctrl+C pour arrêter tous les services..."
wait
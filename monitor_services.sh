#!/bin/bash
echo "🔍 MONITOR DE SERVICIOS ATHCYL"
echo "=============================="

while true; do
    clear
    echo "📊 Estado de servicios ($(date)):"
    echo
    
    # Verificar backend
    BACKEND_PID=$(ps aux | grep "manage.py runserver" | grep -v grep | awk '{print $2}' | head -1)
    if [ -n "$BACKEND_PID" ]; then
        echo "✅ Backend Django: Ejecutándose (PID: $BACKEND_PID)"
        echo "   URL: http://192.168.1.137:8000"
    else
        echo "❌ Backend Django: No ejecutándose"
        echo "   💡 Reiniciar: cd backend && python manage.py runserver 192.168.1.137:8000"
    fi
    
    # Verificar frontend
    EXPO_PID=$(ps aux | grep "expo start" | grep -v grep | awk '{print $2}' | head -1)
    if [ -n "$EXPO_PID" ]; then
        echo "✅ Frontend Expo: Ejecutándose (PID: $EXPO_PID)" 
        echo "   URL: exp://192.168.1.137:8081"
    else
        echo "❌ Frontend Expo: No ejecutándose"
        echo "   💡 Reiniciar: cd frontend && npx expo start"
    fi
    
    echo
    echo "🔄 Actualizando en 5 segundos... (Ctrl+C para salir)"
    sleep 5
done

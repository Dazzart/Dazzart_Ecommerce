#!/bin/bash

echo "🚑 Iniciando Protocolo de Rescate Dazzart..."

# 1. Limpiar Procesos Trabados
echo "🧹 Matando procesos de Node/Vite colgados..."
sudo pkill -9 -f node
sudo pkill -9 -f vite
sudo pkill -9 -f npm

# 2. Activar SWAP de 2GB (Si no existe)
if [ ! -f /swapfile ]; then
    echo "💾 Creando Swap de 2GB..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap activada."
else
    echo "✅ Swap ya existe."
fi

# 3. Liberar Caché de RAM
echo "🧠 Liberando memoria caché..."
sudo sync; sudo sysctl -w vm.drop_caches=3

# 4. Reiniciar Servicios Vitales
echo "🔄 Reiniciando GitLab Runner y Nginx..."
sudo systemctl restart gitlab-runner
sudo systemctl restart nginx

# 5. Verificación Final
echo "📊 Estado Actual de Memoria:"
free -h

echo "🚀 ¡Rescate completado! Intenta redeplegar ahora."

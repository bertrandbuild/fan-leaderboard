#!/bin/bash

# Script de gestion des utilisateurs de développement
# Usage: ./scripts/dev-users.sh [command] [options]

set -e

# Configuration
DEFAULT_COUNT=10
DEFAULT_URL="http://localhost:8000"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo -e "${BLUE}📋 Script de Gestion des Utilisateurs de Développement${NC}"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo -e "${GREEN}Commandes disponibles:${NC}"
    echo "  generate [count]     Génère des utilisateurs de test via l'API"
    echo "  generate-db [count]  Génère des utilisateurs directement en DB"
    echo "  cleanup [--force]    Nettoie les utilisateurs de test"
    echo "  status              Affiche le statut des utilisateurs"
    echo "  help                Affiche cette aide"
    echo ""
    echo -e "${GREEN}Options:${NC}"
    echo "  count               Nombre d'utilisateurs à générer (défaut: 10)"
    echo "  --force             Force l'exécution sans confirmation"
    echo "  --url URL           URL de l'API (défaut: http://localhost:3001)"
    echo ""
    echo -e "${GREEN}Exemples:${NC}"
    echo "  $0 generate 15                    # Génère 15 utilisateurs via API"
    echo "  $0 generate-db 5                  # Génère 5 utilisateurs en DB direct"
    echo "  $0 cleanup --force                # Nettoie sans confirmation"
    echo "  $0 status                         # Affiche les statistiques"
}

# Fonction pour vérifier si le backend est démarré
check_backend() {
    local url="${1:-$DEFAULT_URL}"
    echo -e "${BLUE}🔍 Vérification du backend...${NC}"
    
    if curl -s -f "$url/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend accessible à $url${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend non accessible à $url${NC}"
        echo -e "${YELLOW}💡 Assurez-vous que le serveur backend est démarré avec 'npm run dev'${NC}"
        return 1
    fi
}

# Fonction pour afficher le statut
show_status() {
    local url="${1:-$DEFAULT_URL}"
    echo -e "${BLUE}📊 Statut des Utilisateurs${NC}"
    echo ""
    
    if ! check_backend "$url"; then
        return 1
    fi
    
    echo -e "${BLUE}📈 Récupération des statistiques...${NC}"
    
    # Récupérer les utilisateurs via l'API
    local response=$(curl -s "$url/api/users?limit=1000" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        # Utiliser jq si disponible, sinon estimation basique
        if command -v jq &> /dev/null; then
            local total=$(echo "$response" | jq '.users | length' 2>/dev/null || echo "?")
            local admins=$(echo "$response" | jq '[.users[] | select(.role == "club_admin")] | length' 2>/dev/null || echo "?")
            local users=$(echo "$response" | jq '[.users[] | select(.role == "user")] | length' 2>/dev/null || echo "?")
            
            echo -e "${GREEN}👥 Total des utilisateurs: $total${NC}"
            echo -e "${GREEN}👤 Utilisateurs normaux: $users${NC}"
            echo -e "${GREEN}👨‍💼 Administrateurs de club: $admins${NC}"
        else
            echo -e "${YELLOW}📊 Statistiques détaillées non disponibles (jq non installé)${NC}"
            echo -e "${GREEN}✅ API accessible et fonctionnelle${NC}"
        fi
    else
        echo -e "${RED}❌ Erreur lors de la récupération des données${NC}"
    fi
}

# Fonction pour générer des utilisateurs via API
generate_users_api() {
    local count="${1:-$DEFAULT_COUNT}"
    local url="${2:-$DEFAULT_URL}"
    
    echo -e "${BLUE}🚀 Génération de $count utilisateurs via API...${NC}"
    
    cd "$BACKEND_DIR"
    npm run generate-users-api "$count" "$url"
}

# Fonction pour générer des utilisateurs en DB direct
generate_users_db() {
    local count="${1:-$DEFAULT_COUNT}"
    
    echo -e "${BLUE}🚀 Génération de $count utilisateurs en DB direct...${NC}"
    echo -e "${YELLOW}⚠️  Mode base de données directe (plus rapide mais moins sûr)${NC}"
    
    cd "$BACKEND_DIR"
    npm run generate-users "$count"
}

# Fonction pour nettoyer les utilisateurs
cleanup_users() {
    local force_mode=false
    local url="$DEFAULT_URL"
    
    # Parser les arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force|-f)
                force_mode=true
                shift
                ;;
            --url)
                url="$2"
                shift 2
                ;;
            *)
                url="$1"
                shift
                ;;
        esac
    done
    
    echo -e "${BLUE}🧹 Nettoyage des utilisateurs de test...${NC}"
    
    if [ "$force_mode" = true ]; then
        echo -e "${YELLOW}⚡ Mode force activé - suppression sans confirmation${NC}"
    fi
    
    cd "$BACKEND_DIR"
    if [ "$force_mode" = true ]; then
        npm run cleanup-users "$url" -- --force
    else
        npm run cleanup-users "$url"
    fi
}

# Parser les arguments
case "${1:-help}" in
    "generate")
        count="${2:-$DEFAULT_COUNT}"
        url="${3:-$DEFAULT_URL}"
        if check_backend "$url"; then
            generate_users_api "$count" "$url"
        fi
        ;;
    "generate-db")
        count="${2:-$DEFAULT_COUNT}"
        generate_users_db "$count"
        ;;
    "cleanup")
        shift
        cleanup_users "$@"
        ;;
    "status")
        url="${2:-$DEFAULT_URL}"
        show_status "$url"
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Commande inconnue: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
#!/bin/bash
# Copia o plugin actualizado para o WordPress Local
SRC="$(dirname "$0")/angopress-landing-content.php"
DST="/Users/claudiorodrigues/Local Sites/angopress/app/public/wp-content/plugins/angopress-landing-content.php"

cp "$SRC" "$DST" && echo "✓ Plugin sincronizado: $(date '+%H:%M:%S')" || echo "✗ Erro ao sincronizar"

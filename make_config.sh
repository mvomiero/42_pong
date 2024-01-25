#!/bin/bash

# Define the target folder
TARGET_FOLDER="./config"

# Create the target folder if it doesn't exist
mkdir -p "$TARGET_FOLDER"

# double check below which of these 'old' files are really needed

# List of files to move
FILES=(
    "./manage.py"
    "./pong/admin.py"
    "./pong/routing.py"
    "./pong/templates/pong/index.html"
    "./pong/webSocket_msg_transmit.py"
    "./pong/apps.py"
    "./pong/models.py"
    "./pong/signals.py"
    "./pong/urls.py"
    "./pong/views.py"
    "./pong/webSocket_msg_create.py"
    "./pong/consumers.py"
    "./requirements.txt"
    "./transcendence/__init__.py"
    "./transcendence/asgi.py"
    "./transcendence/urls.py"
    "./transcendence/wsgi.py"
    "./transcendence/settings.py"
    "./static/assets/favicon.ico"
    "./static/assets/icon.svg"
    "./static/assets/img/42_Logo.svg"
    "./static/assets/img/galaxy.jpg"
    "./static/assets/img/landscape.png"
    "./static/assets/img/landscape_pool.png"
    "./static/assets/img/team/flo1.png"
    "./static/assets/img/team/flo2.png"
    "./static/assets/img/team/gb1.png"
    "./static/assets/img/team/gb2.png"
    "./static/assets/img/team/mv1.png"
    "./static/assets/img/team/mv2.png"
    "./static/assets/img/team/pa1.png"
    "./static/assets/img/team/pa2.png"
    "./static/assets/img/team/yy1.png"
    "./static/assets/img/team/yy2.png"
    "./static/assets/title.svg"
    "./static/css/styles.css"
    "./static/css/styles_vaporwave.css"
    "./static/js_dashboard/dashboard.js"
    "./static/js_dashboard/drawCharts.js"
    "./static/js_dashboard/pagination.js"
    "./static/js_dashboard/playerDaschboard.js"
    "./static/js_dashboard/updateCards.js"
    "./static/js_dashboard/fetchData.js"
    "./static/3d_pong/main.js"
)

# Move files to the target folder, preserving relative paths
for FILE in "${FILES[@]}"; do
    # Create the destination directory structure
    DEST_DIR="$TARGET_FOLDER/$(dirname "$FILE")"
    mkdir -p "$DEST_DIR"

    # Move the file to the destination folder, preserving permissions
    cp "$FILE" "$DEST_DIR/"
done

echo "Files moved to $TARGET_FOLDER"

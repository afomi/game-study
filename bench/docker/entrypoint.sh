#!/bin/sh
# Usage (inside the container): entrypoint.sh <rom> <experiment.lua> [timeout-seconds]
# Mesen opens a GUI setup wizard when settings.json is missing, even with
# --testRunner, so seed one in the (tmpfs) home before every run.
set -eu
rom="$1"; script="$2"; timeout="${3:-60}"
home="$HOME/.config/MesenCE"
mkdir -p "$home"
[ -f "$home/settings.json" ] || echo '{}' > "$home/settings.json"
exec /opt/mesen/Mesen --testRunner --timeout="$timeout" --doNotSaveSettings "$rom" "$script"

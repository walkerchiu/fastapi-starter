#!/bin/bash
# 將 i18n commit 標記為 edit
sed -i '' 's/^pick 17e769d6/edit 17e769d6/' "$1"

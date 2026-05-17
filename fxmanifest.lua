fx_version 'cerulean'
game 'gta5'

name 'blazee-notify'
author 'Blazeeot'
description 'Standalone notification system for FiveM'
version '1.0.0'

lua54 'yes'

ui_page 'html/index.html'

shared_script 'config.lua'

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}

files {
    'html/index.html',
    'html/app.css',
    'html/app.js'
}

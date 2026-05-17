# blazee-notify

A standalone FiveM notification system with a sleek ui design, notification sounds, queue handling, exports, events, and framework compatibility/bridge.

<img width="1280" height="900" alt="image" src="https://github.com/user-attachments/assets/7e8ecb5e-5787-4599-a7bf-74ee179b0ca0" />

## Install

Drop the folder into your resources directory and start it from `server.cfg`.

```cfg
ensure blazee-notify
```

The resource does not require ESX, QBCore, ox_lib, etc
Completly Standalone

## Quick Use

Client:

```lua
exports['blazee-notify']:Notify({
    type = 'success',
    title = 'Vehicle Stored',
    message = 'Your vehicle was saved in the garage.',
    duration = 5000
})
```

Server:

```lua
exports['blazee-notify']:Notify(source, {
    type = 'warning',
    title = 'Inventory Full',
    message = 'Clear some space before picking up more items.'
})
```

## Commands

```cfg
/notifytest success Test notification
/notifyshowcase
/notifyclear
```

Server console or ACE allowed admins:

```cfg
svnotify all announcement Restart in 10 minutes
svnotify 3 warning Move your vehicle
```

ACE permission:

```cfg
add_ace group.admin blazee.notify.admin allow
```

## Docs

- [Installation](docs/INSTALLATION.md)
- [API](docs/API.md)
- [Configuration](docs/CONFIGURATION.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## ShowCase Video

https://github.com/user-attachments/assets/9fdc9a9f-4026-46af-b0d0-1394b3c3723c

## License

MIT

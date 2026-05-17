# Installation

## Resource Setup

1. Put `blazee-notify` in your server resources folder.
2. Add the resource to `server.cfg`.

```cfg
ensure blazee-notify
```

3. Restart the server or run this from console:

```cfg
refresh
ensure blazee-notify
```

## Recommended Load Order

Start it before resources that call notifications.

```cfg
ensure blazee-notify
ensure your-scripts
```

## Admin Command Permission

The `svnotify` command is locked behind ACE when used in-game.

```cfg
add_ace group.admin blazee.notify.admin allow
```

Console can use `svnotify` without ACE.

## Renaming An Existing Install

If you are replacing another notification resource, update the export name in your scripts.

```lua
exports['blazee-notify']:Notify(...)
```

Exports use the folder name FiveM starts.

# Configuration

All basic settings live in `config.lua`.

```lua
Config.DefaultDuration = 5500
Config.DefaultPosition = 'top-right'
Config.DefaultType = 'info'
Config.MaxVisible = 5
Config.Volume = 0.62
```

## Commands

```lua
Config.TestCommand = 'notifytest'
Config.ShowcaseCommand = 'notifyshowcase'
Config.ClearCommand = 'notifyclear'
```

Set a command to another name if it conflicts with a resource you already use.

## Compatibility

```lua
Config.Compatibility = {
    genericEvents = true,
    qbcoreEvent = true,
    esxEvent = true
}
```

Turn off a handler if another notification resource is also listening to the same framework event.

## Styling

The UI is styled in `html/app.css`.

Useful values:

```css
--card-width: 394px;
--panel: rgba(11, 14, 18, 0.82);
--panel-deep: rgba(4, 8, 12, 0.9);
--font: "Trebuchet MS", "Segoe UI", sans-serif;
```

Notification colors are controlled by the `.tone-*` classes in the same file.

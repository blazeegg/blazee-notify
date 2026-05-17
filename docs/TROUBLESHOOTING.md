# Troubleshooting

## Black Box Behind The UI

Make sure `html`, `body`, and `#notification-root` stay transparent in `html/app.css`.

```css
html,
body {
    background: transparent;
}
```

Avoid `backdrop-filter` in FiveM NUI. Some CEF builds render it as a black rectangle behind the notification.

## Buttons Do Not Click

FiveM notifications are displayed as a HUD overlay, so the game keeps mouse focus by default. Action buttons need NUI focus if you want them to be clickable.

Use actions for event-driven flows where you intentionally enable cursor focus, or keep notifications passive and let them expire normally.

## Notification Does Not Disappear

Check for:

```lua
persistent = true
progress = false
```

Persistent notifications stay until `Close(id)` or `Clear()` is called.

## Duplicate Notifications

If ESX or QBCore also has another notification resource active, turn off the matching compatibility handler in `config.lua`.

```lua
Config.Compatibility = {
    genericEvents = true,
    qbcoreEvent = false,
    esxEvent = false
}
```

## Export Not Found

Exports use the folder name that FiveM starts. If the folder is named `blazee-notify`, use:

```lua
exports['blazee-notify']:Notify(...)
```

If you keep the old folder name, the export name stays old too.

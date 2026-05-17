# API

## Client Exports

```lua
exports['blazee-notify']:Notify(data)
exports['blazee-notify']:ShowNotification(data)
exports['blazee-notify']:Push(data)
exports['blazee-notify']:Close(id)
exports['blazee-notify']:Clear()
exports['blazee-notify']:SetPosition(position)
```

## Server Exports

```lua
exports['blazee-notify']:Notify(target, data)
exports['blazee-notify']:ShowNotification(target, data)
exports['blazee-notify']:Push(target, data)
```

Use `target = -1` or `target = 'all'` to send to everyone from server-side code.

## Client Events

```lua
TriggerEvent('blazee-notify:notify', data)
TriggerEvent('blazee-notify:client:notify', data)
TriggerEvent('blazee-notify:close', id)
TriggerEvent('blazee-notify:clear')
```

## Server Event

```lua
TriggerServerEvent('blazee-notify:server:notify', target, data)
```

Normal players can only send the notification back to themselves through this event. Sending to another player or everyone requires `blazee.notify.admin`.

## Notification Data

```lua
{
    id = 'optional-id',
    type = 'success',
    title = 'Title',
    message = 'Message body',
    duration = 5500,
    position = 'top-right',
    sound = true,
    volume = 0.62,
    persistent = false,
    progress = true,
    accent = '#36f29a',
    image = 'https://example.com/image.png',
    metadata = {
        { label = 'Amount', value = '$12,750' }
    },
    actions = {
        { label = 'Accept', event = 'my-resource:accepted' },
        { label = 'Server', event = 'my-resource:serverAction', server = true },
        { label = 'Dismiss' }
    }
}
```

## Types

```txt
success
error
warning
info
message
dispatch
system
announcement
money
staff
```

Aliases such as `primary`, `warn`, `danger`, `police`, `ems`, `cash`, and `admin` are normalized automatically.

## Positions

```txt
top-left
top-center
top-right
middle-left
middle-right
bottom-left
bottom-center
bottom-right
```

## Framework Compatibility

These handlers are included when enabled in `config.lua`.

```lua
TriggerEvent('QBCore:Notify', 'Message', 'success', 5000)
TriggerEvent('esx:showNotification', 'Message', 'info', 5000)
TriggerEvent('blazee_notify:notify', 'Message', 'info')
TriggerEvent('notifications:client:notify', 'Message', 'info')
```

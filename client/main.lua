local labels = {
    success = 'Success',
    error = 'Error',
    warning = 'Warning',
    info = 'Information',
    message = 'Message',
    dispatch = 'Dispatch',
    system = 'System',
    announcement = 'Announcement',
    money = 'Transaction',
    staff = 'Staff'
}

local aliases = {
    primary = 'info',
    inform = 'info',
    normal = 'info',
    caution = 'warning',
    warn = 'warning',
    danger = 'error',
    police = 'dispatch',
    ambulance = 'dispatch',
    ems = 'dispatch',
    bank = 'money',
    cash = 'money',
    admin = 'staff',
    announce = 'announcement'
}

local function coerceBool(value, fallback)
    if value == nil then
        return fallback
    end

    return value == true
end

local function normalizeType(value)
    local notificationType = tostring(value or Config.DefaultType or 'info'):lower()
    return aliases[notificationType] or notificationType
end

local function makeId()
    return ('blazee_%s_%s'):format(GetGameTimer(), math.random(1000, 9999))
end

local function normalizeNotification(data, forcedType, forcedTitle, forcedDuration)
    if type(data) == 'string' then
        data = {
            message = data,
            type = forcedType,
            title = forcedTitle,
            duration = forcedDuration
        }
    end

    if type(data) ~= 'table' then
        return nil
    end

    local notificationType = normalizeType(data.type or data.style or data.category or forcedType)
    local title = data.title or data.header or forcedTitle or labels[notificationType] or labels.info
    local message = data.message or data.description or data.text or data.msg or data.caption or ''
    local duration = tonumber(data.duration or data.length or data.time or forcedDuration or Config.DefaultDuration) or Config.DefaultDuration

    return {
        id = data.id or makeId(),
        type = notificationType,
        title = title,
        message = message,
        duration = duration,
        position = data.position or Config.DefaultPosition,
        icon = data.icon,
        image = data.image or data.avatar,
        sound = data.sound,
        volume = tonumber(data.volume or Config.Volume) or Config.Volume,
        persistent = coerceBool(data.persistent or data.sticky, false),
        progress = coerceBool(data.progress, true),
        accent = data.accent,
        actions = data.actions,
        metadata = data.metadata or data.meta or data.details
    }
end

local function notify(data, forcedType, forcedTitle, forcedDuration)
    local notification = normalizeNotification(data, forcedType, forcedTitle, forcedDuration)

    if not notification then
        return nil
    end

    SendNUIMessage({
        action = 'notify',
        notification = notification,
        options = {
            maxVisible = Config.MaxVisible,
            defaultPosition = Config.DefaultPosition
        }
    })

    return notification.id
end

local function closeNotification(id)
    SendNUIMessage({
        action = 'close',
        id = id
    })
end

local function clearNotifications()
    SendNUIMessage({
        action = 'clear'
    })
end

local function setPosition(position)
    Config.DefaultPosition = position or Config.DefaultPosition

    SendNUIMessage({
        action = 'configure',
        options = {
            maxVisible = Config.MaxVisible,
            defaultPosition = Config.DefaultPosition
        }
    })
end

exports('Notify', notify)
exports('ShowNotification', notify)
exports('Push', notify)
exports('Close', closeNotification)
exports('Clear', clearNotifications)
exports('SetPosition', setPosition)

RegisterNetEvent('blazee-notify:notify', function(data, forcedType, forcedTitle, forcedDuration)
    notify(data, forcedType, forcedTitle, forcedDuration)
end)

RegisterNetEvent('blazee-notify:client:notify', function(data, forcedType, forcedTitle, forcedDuration)
    notify(data, forcedType, forcedTitle, forcedDuration)
end)

RegisterNetEvent('blazee-notify:close', function(id)
    closeNotification(id)
end)

RegisterNetEvent('blazee-notify:clear', function()
    clearNotifications()
end)

if Config.Compatibility.genericEvents then
    RegisterNetEvent('blazee_notify:notify', function(data, forcedType, forcedTitle, forcedDuration)
        notify(data, forcedType, forcedTitle, forcedDuration)
    end)

    RegisterNetEvent('notifications:client:notify', function(data, forcedType, forcedTitle, forcedDuration)
        notify(data, forcedType, forcedTitle, forcedDuration)
    end)

end

if Config.Compatibility.qbcoreEvent then
    RegisterNetEvent('QBCore:Notify', function(text, textType, length)
        local title = labels[normalizeType(textType)] or labels.info
        local message = text

        if type(text) == 'table' then
            title = text.caption or text.title or title
            message = text.text or text.message or text.description or ''
        end

        notify({
            title = title,
            message = message,
            type = textType or 'info',
            duration = length
        })
    end)
end

if Config.Compatibility.esxEvent then
    RegisterNetEvent('esx:showNotification', function(message, notificationType, duration)
        notify({
            title = labels[normalizeType(notificationType)] or labels.info,
            message = message,
            type = notificationType or 'info',
            duration = duration
        })
    end)
end

RegisterNUICallback('notificationAction', function(payload, cb)
    if type(payload) == 'table' and payload.event then
        if payload.server then
            TriggerServerEvent(payload.event, payload.args or payload.notificationId)
        else
            TriggerEvent(payload.event, payload.args or payload.notificationId)
        end
    end

    cb({ ok = true })
end)

RegisterCommand(Config.TestCommand, function(_, args)
    local notificationType = args[1] or 'info'
    local message = table.concat(args, ' ', 2)

    if message == '' then
        message = 'Test Notification'
    end

    notify({
        type = notificationType,
        title = labels[normalizeType(notificationType)] or 'Notification',
        message = message,
        duration = 5200,
    })
end, false)

RegisterCommand(Config.ShowcaseCommand, function()
    local showcase = {
        {
            type = 'success',
            title = 'Heist Hack Success',
            message = 'You have completed the hack',
            metadata = {
                { label = 'Crew', value = '4/4' },
                { label = 'Payout', value = '$84,500' }
            }
        },
        {
            type = 'dispatch',
            title = '10-80 In Progress',
            message = 'High speed chase',
            position = 'top-center',
            duration = 7000,
            actions = {
                { label = 'Set GPS', event = 'blazee-notify:demoAction' },
                { label = 'Dismiss' }
            }
        },
        {
            type = 'warning',
            title = 'Low Fuel',
            message = 'Vehicle fuel is low',
            position = 'top-left'
        },
        {
            type = 'money',
            title = 'Deposit Received',
            message = 'Bank Deposit Successful',
            duration = 6000,
            metadata = {
                { label = 'Amount', value = '$12,750' },
                { label = 'Status', value = 'Cleared' }
            }
        },
        {
            type = 'staff',
            title = 'Staff Notice',
            message = 'A Staff Member has accepted your report',
            position = 'middle-right',
            duration = 6000,
            actions = {
                { label = 'Open', event = 'blazee-notify:demoAction' },
                { label = 'Dismiss' }
            }
        }
    }

    for index = 1, #showcase do
        notify(showcase[index])
        Wait(650)
    end
end, false)

RegisterCommand(Config.ClearCommand, function()
    clearNotifications()
end, false)

AddEventHandler('blazee-notify:demoAction', function()
    notify({
        type = 'system',
        title = 'Action Triggered',
        message = 'Notification actions can fire client or server events.',
        duration = 3800
    })
end)

CreateThread(function()
    Wait(1200)
    SendNUIMessage({
        action = 'configure',
        options = {
            maxVisible = Config.MaxVisible,
            defaultPosition = Config.DefaultPosition
        }
    })
end)

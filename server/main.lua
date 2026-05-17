local function notifyTarget(target, data, forcedType, forcedTitle, forcedDuration)
    local resolvedTarget = target

    if resolvedTarget == nil or resolvedTarget == 'all' then
        resolvedTarget = -1
    else
        resolvedTarget = tonumber(resolvedTarget) or resolvedTarget
    end

    TriggerClientEvent('blazee-notify:notify', resolvedTarget, data, forcedType, forcedTitle, forcedDuration)
end

exports('Notify', notifyTarget)
exports('ShowNotification', notifyTarget)
exports('Push', notifyTarget)

local function handleServerNotify(src, target, data, forcedType, forcedTitle, forcedDuration)
    if src ~= 0 then
        local numericTarget = tonumber(target)

        if target == nil then
            target = src
        elseif numericTarget ~= src and target ~= src and not IsPlayerAceAllowed(src, 'blazee.notify.admin') then
            target = src
        end
    end

    notifyTarget(target, data, forcedType, forcedTitle, forcedDuration)
end

RegisterNetEvent('blazee-notify:server:notify', function(target, data, forcedType, forcedTitle, forcedDuration)
    handleServerNotify(source, target, data, forcedType, forcedTitle, forcedDuration)
end)

RegisterCommand('svnotify', function(source, args)
    if source ~= 0 and not IsPlayerAceAllowed(source, 'blazee.notify.admin') then
        return
    end

    local target = args[1] or 'all'
    local notificationType = args[2] or 'info'
    local message = table.concat(args, ' ', 3)

    if message == '' then
        message = 'Server notification test from blazee-notify.'
    end

    notifyTarget(target, {
        type = notificationType,
        title = 'Server Notice',
        message = message,
        duration = 5500
    })
end, true)

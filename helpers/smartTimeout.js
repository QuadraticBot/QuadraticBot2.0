const smartTimeout = (callback, time) => {
    const MAX_TIME = 2147483647
    let smartTime = 0
    if (time > MAX_TIME) smartTime = MAX_TIME

    setTimeout(() => {
        if (!smartTime) callback()
        else smartTimeout(callback, time - smartTime)
    }, smartTime || time)
}

module.exports = smartTimeout

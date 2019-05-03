"use strict"

class Widget {
    constructor(config) {}
    create(config) {
        var type = config.type

        if (type == "TABS") {
            var dom = Tabs(config)
        }
        return dom
    }
}

class TABS {
    constructor(config) {
        var tabs = config.tabs
        var dom = document.createElement("div")
        dom.className = "col s12"

        var ul = document.createElement("ul")
        ul.className = "tabs"

        for (let index = 0; index < tabs.length; index++) {
            const tab = tabs[index]

            var li = document.createElement("li")
            li.className = "tab col s3"
            var text = document.createElement("a")
            text.href = "#tab" + index
            text.innerHTML = tab.label
            li.appendChild(text)
            ul.appendChild(li)
        }
        dom.appendChild(ul)

        return dom
    }
}

class STYLED_BUTTON {
    constructor(config) {
        var dom = document.createElement("a")
        dom.className = "waves-effect waves-light btn"
        dom.id = "tab" + config.tabId
        dom.innerHTML = config.offButtonState.text || "OFF"
        return dom
    }
}

function getAnchor() {
    var currentUrl = document.URL,
        urlParts = currentUrl.split('#')

    return (urlParts.length > 1) ? urlParts[1] : 0
}

function create(config) {
    var type = config.type

    if (type == "TABS") {
        console.log(config)
        var widget = new TABS(config)
        console.log(config)
    } else if (type == "STYLED_BUTTON") {
        var widget = new STYLED_BUTTON(config)
    } else {
        var widget = document.createElement("meta")
    }
    return widget
}

module.exports = create
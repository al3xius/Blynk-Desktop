"use strict"

const Store = require("electron-store")
const store = new Store();

var devices = store.get("devices") || []

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
    constructor(properties) {
        var tabs = properties.tabs
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
    constructor(properties, access) {
        var dom = document.createElement("a")
        dom.className = "waves-effect waves-light btn"
        dom.id = "tab" + properties.tabId
        var text = (properties.label || "") + " "
        var offtext = properties.offButtonState.text || "OFF"
        dom.innerHTML = text + offtext

        for (let index = 0; index < devices.length; index++) {
            if (devices[index].id == properties.deviceId) {
                var token = devices[index].token
                break
            }
        }

        switch (properties.pinType) {
            case "DIGITAL":
                var pin = "D" + properties.pin

            case "VIRTUAL":
                var pin = "V" + properties.pin
        }

        dom.onclick = function() {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; //TODO: make more secure
            var currentValue = 0

            //get current value
            https.get("https://" + access.url + ":" + access.port + "/" + token + "/get/" + pin, (resp) => {
                let data = ""

                resp.on("data", (chunk) => {
                    data += chunk
                })
                resp.on("end", () => {
                    currentValue = JSON.parse(data)[0]

                    if (currentValue == properties.max && !properties.pushMode) {
                        var value = properties.min
                    } else {
                        var value = properties.max
                    }

                    //send new Value
                    https.get("https://" + access.url + ":" + access.port + "/" + token + "/update/" + pin + "?value=" + value, (resp) => {
                        let data = ""

                        resp.on("data", (chunk) => {
                            data += chunk
                        })
                        resp.on("end", () => {})
                    }).on("error", (err) => {
                        console.log("Error: " + err.message)
                    })
                })
            }).on("error", (err) => {
                console.log("Error: " + err.message)
            })
        }
        return dom
    }
}

class BUTTON {
    constructor(properties, access) {
        var dom = document.createElement("a")
        dom.className = "waves-effect waves-light btn"
        dom.id = "tab" + properties.tabId
        dom.innerHTML = "OFF"

        for (let index = 0; index < devices.length; index++) {
            if (devices[index].id == properties.deviceId) {
                var token = devices[index].token
                break
            }
        }

        switch (properties.pinType) {
            case "DIGITAL":
                var pin = "D" + properties.pin

            case "VIRTUAL":
                var pin = "V" + properties.pin
        }

        dom.onclick = function() {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; //TODO: make more secure
            var currentValue = 0

            //get current value
            https.get("https://" + access.url + ":" + access.port + "/" + token + "/get/" + pin, (resp) => {
                let data = ""

                resp.on("data", (chunk) => {
                    data += chunk
                })
                resp.on("end", () => {
                    currentValue = JSON.parse(data)[0]

                    if (currentValue == properties.max && !properties.pushMode) {
                        var value = properties.min
                    } else {
                        var value = properties.max
                    }

                    //send new Value
                    https.get("https://" + access.url + ":" + access.port + "/" + token + "/update/" + pin + "?value=" + value, (resp) => {
                        let data = ""

                        resp.on("data", (chunk) => {
                            data += chunk
                        })
                        resp.on("end", () => {})
                    }).on("error", (err) => {
                        console.log("Error: " + err.message)
                    })
                })
            }).on("error", (err) => {
                console.log("Error: " + err.message)
            })
        }
        return dom
    }
}

function getAnchor() {
    var currentUrl = document.URL,
        urlParts = currentUrl.split('#')

    return (urlParts.length > 1) ? urlParts[1] : 0
}

function create(properties, access) {
    var type = properties.type

    if (type == "testTABS") {
        var widget = new TABS(properties)
    } else if (type == "STYLED_BUTTON") {
        var widget = new STYLED_BUTTON(properties, access)
    } else if (type == "BUTTON") {
        var widget = new BUTTON(properties, access)
    } else {
        var widget = document.createElement("meta")
    }
    return widget
}

module.exports = create
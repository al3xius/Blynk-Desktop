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

class STYLED_BUTTON {
    constructor(properties, access) {
        var dom = document.createElement("div")
        var ul = document.createElement("ul")
        var li1 = document.createElement("li")
        var lable = document.createElement("label")
        lable.innerHTML = properties.label || ""
        li1.appendChild(lable)

        var li2 = document.createElement("li")
        var button = document.createElement("a")
        button.className = "waves-effect waves-light btn"
        button.id = "tab" + properties.tabId
        var offtext = properties.offButtonState.text || "OFF"
        button.innerHTML = offtext

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

        button.onclick = function() {
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
        li2.appendChild(button)
        ul.appendChild(li1)
        ul.appendChild(li2)
        dom.appendChild(ul)
        return dom
    }
}

class BUTTON {
    constructor(properties, access) {
        var dom = document.createElement("div")
        var lable = document.createElement("label")
        lable.innerHTML = properties.label || ""

        var button = document.createElement("a")
        button.className = "waves-effect waves-light btn"
        button.id = "tab" + properties.tabId
        button.innerHTML = "OFF"

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

        button.onclick = function() {
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

        dom.appendChild(lable)
        dom.appendChild(button)
        return dom
    }
}

class SLIDER {
    constructor(properties, access) {
        var dom = document.createElement("div")
        var ul = document.createElement("ul")
        var li1 = document.createElement("li")
        var lable = document.createElement("label")
        lable.innerHTML = properties.label || ""
        li1.appendChild(lable)

        var li2 = document.createElement("li")
        var slider = document.createElement("input")
        slider.type = "range"
        slider.min = properties.min
        slider.max = properties.max
            //dom.step = 1
        slider.id = "tab" + properties.tabId

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

        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; //TODO: make more secure
        var currentValue = 0

        //get current value
        https.get("https://" + access.url + ":" + access.port + "/" + token + "/get/" + pin, (resp) => {
            let data = ""

            resp.on("data", (chunk) => {
                data += chunk
            })
            resp.on("end", () => {
                currentValue = JSON.parse(data)[0] || 0
                slider.value = currentValue
                return slider
            })
        }).on("error", (err) => {
            console.log("Error: " + err.message)
        })

        slider.onclick = function() {
            var value = slider.value

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
        }

        li2.appendChild(slider)
        ul.appendChild(li1)
        ul.appendChild(li2)
        dom.appendChild(ul)
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

    if (type == "SLIDER") {
        var widget = new SLIDER(properties, access)
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
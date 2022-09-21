const set_button = document.getElementById('set_button')
const setting_component = document.getElementById('setting-component')
const logout = document.getElementById('logout')

const dbAccess = require('./mirror_db')

set_button.addEventListener("click", function () { viewSettingAlert() })
logout.addEventListener("click", function () { mirrorLogout() })

console.log('setting')

function viewSettingAlert()  {
    if(setting_component.style.display == "block"){
        setting_component.style.display = "none"
        set_button.style.backgroundColor = "transparent"
    }
    else {
        setting_component.style.display = "block"
        set_button.style.backgroundColor = "rgba(105, 105, 105, 0.418)"
    }
}

function setSettingAlert() {
    document.getElementById('set-mirror-id').innerText = dbAccess.getMirror_id()
    document.getElementById('set-user-id').innerText = dbAccess.getId()
    document.getElementById('set-user-name').innerText = dbAccess.name
}

setSettingAlert()

function mirrorLogout() {
    document.location.href=`./init.html`

}
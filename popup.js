let config = {
    settings: {
        opened: false,
    }
}
const gearButton = document.querySelector("#popup-button");
const modal = document.querySelector("#modal")

gearButton.addEventListener("click", () => {
    if (config.settings.opened){
        modal.style.display = "hidden";
        modal.style.zIndex = -1;
        modal.style.opacity = 0;
        modal.style.transform = "scale(1.1)";
        config.settings.opened = false;

    }
    else {
        modal.style.zIndex = 10;
        modal.style.display = "block";
        modal.style.opacity = 1.0;
        modal.style.transform = "scale(1.0)";
        config.settings.opened = true;
    }
})

class Member {
    constructor(username, uuid, badge){
         this.username = username;
         this.uiid     = uuid;
         this.badge    = badge;
    }
}

class Lobby {
    constructor(){
        this.host                = new Member;
        this.hostNicknameElement = document.querySelector(".host-nickname");
        this.hostBadgeElement    = document.querySelector(".badge");
        this.members     = [];
        this.htmlList    = document.querySelector(".lobby-list");
        this.rowTemplate = document.querySelector(".template-lobby-row");
    }
    
    loadSession(){
        let host = JSON.parse(window.localStorage.getItem("host"))
        if(host === null){ this.endSession(); return;};
        let memberlist = JSON.parse(window.localStorage.getItem("member-list")) || [];
        this.addHost(host.username, host.uuid, host.badge);
        memberlist.forEach((member) => {
            this.addUser(member);
        })
    }

    addHost(username,uuid,badge){
        this.host = new Member(username, uuid, badge);
        this.hostNicknameElement.innerHTML = `Host: <b><i>${username}</i></b>`;
        this.hostBadgeElement.style.display = "block";
        this.hostBadgeElement.setAttribute("class", "badge")
        this.hostBadgeElement.innerHTML = badge;
        
        window.localStorage.setItem("host", JSON.stringify(this.host))
    }

    endSession(){ 
        chrome.storage.local.clear();
    }

    kickUserByUiid(uuid){
        document.getElementById(`${uuid}`).remove();
        let objIndex = this.members.findIndex((member) => {
            return member.uuid === uuid;
        })

        if (!objIndex){
            console.log(`No user with ${uuid} was found `);
            return;
        }
        this.members.slice(objIndex, 1);
    }

    addUser(username, uuid, badge){
        this.members.push(new Member(username, uuid, badge));
        
        // HTML //
        let userElement = this.rowTemplate.content.cloneNode(true);
        let usernameSpan =  userElement.querySelector(".lobby-username");
        usernameSpan.textContent = username;
        let userUuid = userElement.querySelector(".lobby-row");
        userUuid.id = uuid;
        this.htmlList.prepend(userElement);
       
        window.localStorage.setItem("member-list", JSON.stringify(this.members));
    }

}

const lobby = new Lobby();

lobby.htmlList.addEventListener("click", (e) => {
    if(!e.target.classList.contains("kick-user")) return;

    let rowElement = e.target.closest(".lobby-row");
    let uuid = rowElement.id;
    lobby.kickUserByUiid(uuid);
})
lobby.htmlList.addEventListener("mouseover", (e) => {
    if(!(e.target.classList.contains("lobby-row") || 
        e.target.classList.contains("lobby-user-actions") ||
        e.target.classList.contains("kick-user"))) return;

    let rowElement = e.target.closest(".lobby-row");
    let userActionseElement = rowElement.querySelector(".lobby-user-actions");
    userActionseElement.style.display = "block";

})
lobby.htmlList.addEventListener("mouseout", (e) => {
    if(!(e.target.classList.contains("lobby-row") || 
       e.target.classList.contains("lobby-user-actions") ||
       e.target.classList.contains("kick-user"))) return;

    let rowElement = e.target.closest(".lobby-row");
    let userActionseElement = rowElement.querySelector(".lobby-user-actions");
    userActionseElement.style.display = "none";
})

window.addEventListener('beforeunload', function (e) {
    lobby.endSession();
});

lobby.loadSession();


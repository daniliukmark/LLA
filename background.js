class StantionHub {
    constructor()
}
chrome.windows.onRemoved.addListener( () => {
    lobby.endSession();
});

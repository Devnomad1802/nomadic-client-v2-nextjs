// Tiny cross-component signal: which host conversation is on screen right now.
// The global chat notifier stays quiet for it.
let activeConvoId = null;
export const setActiveChatConvo = (id) => { activeConvoId = id; };
export const getActiveChatConvo = () => activeConvoId;

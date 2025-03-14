(()=>{class t extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),this.cdnUrl="https://cdn.jsdelivr.net/gh/loomlayorg/widget-public@main",this._initConfig(),this.isExtraLoggingEnabled=!0,this.agentList=[],this.isSettingsEnabled=!1,this.isPipActive=!1,this.isPipRequestInProgress=!1,this.waitingMessagesTimers=[],this.automaticMessagesConfig=this._getDefaultAutomaticMessagesConfig(),this.isChatOpen=!0,this.initialMessage="",this.extraParams=""}_initConfig(){this.config={apiEndpoint:"https://api.loomlay.com/api:sDfF41c6/conversation/create",authToken:"some_token",agentUUID:"01876f7a09b24a43b76fe0fcd4daeee5",accessKey:null,chatTitle:"Loomlay Chat",closeButtonColor:"#2773747",sendButtonColor:"#2773747",switchButtonColor:"#2773747",headerColor:"#2773747",footerColor:"#2773747",bodyColor:"#2773747",messageInputColor:"#2773747",openChatButtonColor:"#2773747",extraContext:null,contextMemory:"",autoResponse:!1,openWidgetIconUrl:this.cdnUrl+"/images/chat_button.svg",logoIconUrl:this.cdnUrl+"/images/logo.svg"},this.requestBody={agent_uuid:this.config.agentUUID,context:null,extra_context:null,continue:!0,key:null,extra_params:null}}_getDefaultAutomaticMessagesConfig(){return[{message:"your request recieved",timeout:5e3},{message:"analyzing the data",timeout:1e4},{message:"preparing the answer",timeout:2e4}]}_setupEvents(){this.chatMessages?(console.log("Attaching click events to:",this.chatMessages),this.chatMessages.addEventListener("click",t=>{var e,s,o=t.target.closest(".replybutton, .replylink");o&&(t.preventDefault(),e=o.getAttribute("data-action"),s=o.getAttribute("data-url"),o=o.getAttribute("data-context"),"open-current"===e?s&&(window.location.href=s):"open-new"===e?s&&window.open(s,"_blank"):"prompt"===e?o&&this._sendMessage(o):o&&(console.log("Delegated Click (Normal Mode) - Context:",o),"function"==typeof this._sendStartMessage?this._sendStartMessage(o,t):console.error("_sendStartMessage is not defined.")))}),this.messageInput.addEventListener("keydown",this._handleEnterKey.bind(this)),this.closeChatButton.addEventListener("click",this.closeChat.bind(this)),this.popOutChatButton.addEventListener("click",this._handlePopout.bind(this)),this.clearChatButton.addEventListener("click",this._clearChatCache.bind(this)),this.openChatButton.addEventListener("click",this._openChat.bind(this)),this.sendButton.addEventListener("click",()=>this._sendMessage()),this.isSettingsEnabled&&this.settingsButton&&this.agentDropdownContainer&&this.settingsButton.addEventListener("click",this._toggleAgentDropdown.bind(this)),this.isSettingsEnabled&&this.agentDropdown&&(this._populateAgentDropdown(),this.agentDropdown.addEventListener("change",this._handleAgentChange.bind(this)))):console.error("Chat messages container not found.")}connectedCallback(){this._replaceActions(),this._loadConfigFromDomAttributes(),this._loadAutomaticMessages(),this._loadExtraContext(),this._loadExtraParams(),this._loadAuthToken(),this._processAgents(),this._updateRequestContext(),this._render(),this._setupEvents(),this._loadConversationCache(),this._setInitialState(),this._scrollToChatBottom()}_loadConfigFromDomAttributes(){this.config.chatTitle=this.getAttribute("title")||this.config.chatTitle,this.config.closeButtonColor=this.getAttribute("closeButtonColour")||this.config.closeButtonColor,this.config.sendButtonColor=this.getAttribute("sendButtonColor")||this.config.sendButtonColor,this.config.switchButtonColor=this.getAttribute("switchButtonColor")||this.config.switchButtonColor,this.config.headerColor=this.getAttribute("headerColor")||this.config.headerColor,this.config.footerColor=this.getAttribute("footerColor")||this.config.footerColor,this.config.bodyColor=this.getAttribute("bodyColor")||this.config.bodyColor,this.config.messageInputColor=this.getAttribute("messageInputColor")||this.config.messageInputColor,this.config.openChatButtonColor=this.getAttribute("openChatButtonColor")||this.config.openChatButtonColor,this.config.autoResponse="true"===this.getAttribute("auto-response")||this.config.autoResponse,this.isChatOpen="true"===this.getAttribute("isOpen")||this.config.isOpen,this.initialMessage=this.getAttribute("initial-message")||this.config.initialMessage,this.config.contextMemory=this.getAttribute("context")||this.config.contextMemory,this.config.openWidgetIconUrl=this.getAttribute("open-icon")||this.config.openWidgetIconUrl,this.config.logoIconUrl=this.getAttribute("chat-logo")||this.config.logoIconUrl}_loadAutomaticMessages(){var t=this.querySelector("automaticResponseMessages");t&&0<(t=t.querySelectorAll("message")).length&&(this.automaticMessagesConfig=Array.from(t).map(t=>{var e=parseInt(t.getAttribute("timeout"),10);return{message:t.textContent,timeout:isNaN(e)?0:e}}))}_loadExtraContext(){var t=this.querySelector("userContext");this.config.extraContext=t?.innerHTML||this.config.extraContext}_loadExtraParams(){var t=this.querySelector("extraParams");try{this.extraParams=t?.innerHTML?JSON.parse(t.innerHTML):this.config.extra_params}catch(t){console.error("Error parsing extraParams JSON:",t),this.extraParams=this.config.extra_params}}_loadAuthToken(){this.authToken=this.getAttribute("accesskey"),this.authToken&&(this.config.authToken=this.authToken)}_processAgents(){var t=this.querySelector("agents"),t=t?Array.from(t.querySelectorAll("agent")):[];this.isSettingsEnabled=1<t.length,0<t.length&&(this._loadAgentList(t),this._initAgentSelection())}_loadAgentList(t){this.agentList=t.map(t=>({agent_uuid:t.getAttribute("uuid"),agent_name:t.getAttribute("name"),agent_description:t.getAttribute("description")})).filter(t=>t.agent_uuid&&t.agent_name)}_initAgentSelection(){var t=localStorage.getItem("selectedAgent");t?this.config.agentUUID=t:0<this.agentList.length&&(this.config.agentUUID=this.agentList[0].agent_uuid),this.requestBody.agent_uuid=this.config.agentUUID}_updateRequestContext(){this.requestBody.extra_context=this.config.extraContext,this.requestBody.extra_params=this.extraParams}_scrollToChatBottom(){this.chatMessages&&this.chatMessages.scrollTo({top:this.chatMessages.scrollHeight,behavior:"smooth"})}_render(){var t=!("0"===this.config.contextMemory||"off"===this.config.contextMemory.toLowerCase()),e=this.config.contextMemory&&"select"===this.config.contextMemory.toLowerCase(),e=this._getHeaderRightItemsHtml(e?"block":"none",t?"checked":""),t=this.isSettingsEnabled?this._getAgentDropdownHtml():"",s=this.isPipActive?"0":"10px",o=document.querySelector('link[rel="stylesheet"][href*="chat.css"]').getAttribute("href");this.shadow.innerHTML=`
                <style>
                    @import url('${o}');
                    .chat-container {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
                    }
                    .chat-container.pip-active-inline {
                        transform: translateY(100vh);
                        opacity: 0;
                        pointer-events: none;
                    }
                </style>
                <div id="chat-container" class="chat-container" style="border-radius: ${s}">
                    ${this._renderChatHeader(e,t)}
                    ${this._renderChatMessages()}
                    ${this._renderChatInput()}
                    <div id="cr"> Powered by <a href="loomlay.com"> loomlay</a></div>
                </div>
                ${this._getOpenChatButtonHtml()}
            `,this._cacheElements()}_renderChatHeader(t,e){return`
                <div id="chat-header" class="chat-header" style="background-color: ${this.config.headerColor}">
                    <div class="header-title">
                        <img class="logo" style="height:12px" src="${this.config.logoIconUrl}" alt="Logo">
                        <span>${this.config.chatTitle}</span>
                    </div>
                    <div id="header-right-items" class="header-right-items">
                        ${t}
                    </div>
                    ${e}
                </div>
            `}_renderChatMessages(){return`
                <div id="chat-messages" class="chat-messages" style="background-color: ${this.config.bodyColor}">
                    <div id="defaultbackground" class="default-background" >
                        <img src="${this.cdnUrl}/images/default.svg" alt="Default Background">
                        <br/><br/>
                    </div>
                </div>
            `}_renderChatInput(){return`
                <div id="chat-input" class="chat-input" style="background-color: ${this.config.footerColor}">
                    <input type="text" id="message-input" class="message-input" style="background-color: ${this.config.messageInputColor}" placeholder="Type your message...">
                    <button id="send-button" class="send-button" style="background-color: ${this.config.sendButtonColor}" aria-label="Send">
                        <img src="${this.cdnUrl}/images/chat_input.svg" alt="Send">
                    </button>
                </div>
            `}_getHeaderRightItemsHtml(t,e){return`
                ${this._getMemoryCheckboxHtml(t,e)}
                ${this.isSettingsEnabled?this._getSettingsButtonHtml():""}
                ${this._getPopOutChatButtonHtml()}
                ${this._getClearChatButtonHtml()}
                ${this._getCloseChatButtonHtml()}
            `}_getMemoryCheckboxHtml(t,e){return`
                <div class="memory-container" style="display: ${t};">
                    <input type="checkbox" id="continue-checkbox" class="memory-checkbox" style="background-color: ${this.config.switchButtonColor};" ${e} >
                    <label for="continue-checkbox" class="memory-checkbox-label">Context</label>
                </div>
            `}_getSettingsButtonHtml(){return console.log("_getSettingsButtonHtml - isPipActive:",this.isPipActive),`<button id="settings-button" class="header-button" style="display: ${this.isPipActive?"none":"block"}" aria-label="Settings">
                        <img src="${this.cdnUrl}/images/settings.svg" alt="Settings">
                    </button>`}_getPopOutChatButtonHtml(){console.log(" _getPopOutChatButtonHtml - isPipActive:",this.isPipActive);var t=this.isPipActive?"none":"block";return`<button id="popout-chat-button" class="header-button" style="background-color: ${this.config.closeButtonColor}; display: ${t}" aria-label="PopOut Chat">
                        <img src="${this.cdnUrl}/images/open_new_window.svg" alt="Pop Out Chat">
                    </button>`}_getClearChatButtonHtml(){return`<button id="clear-chat-button" class="header-button" style="background-color: ${this.config.closeButtonColor}" aria-label="Clear Chat">
                        <img src="${this.cdnUrl}/images/tabler_refresh.svg" alt="Clear Chat">
                    </button>`}_getCloseChatButtonHtml(){console.log("_getCloseChatButtonHtml - isPipActive:",this.isPipActive);var t=this.isPipActive?"none":"block";return`<button id="close-chat-button" class="header-button" style="background-color: ${this.config.closeButtonColor}; display: ${t}" aria-label="Close Chat">
                        <img src="${this.cdnUrl}/images/close.svg" alt="Close Chat">
                    </button>`}_getAgentDropdownHtml(){return`
                <div id="agent-dropdown-container" class="agent-dropdown-container">
                    <select class="mainselection" id="agent-dropdown">
                        <option value="" disabled selected>Select Agent</option>
                    </select>
                </div>
            `}_getOpenChatButtonHtml(){return`<button id="open-chat-button" class="open-chat-button" style="background: ${this.config.openChatButtonColor};">
                        <img class="open-chat-icon" style="margin-left:-4px;margin-top:5px" src="${this.config.openWidgetIconUrl}" alt="Open Chat">
                    </button>`}_cacheElements(){this.chatContainer=this.shadow.querySelector("#chat-container"),this.chatHeader=this.shadow.querySelector("#chat-header"),this.chatMessages=this.shadow.querySelector("#chat-messages"),this.messageInput=this.shadow.querySelector("#message-input"),this.sendButton=this.shadow.querySelector("#send-button"),this.closeChatButton=this.shadow.querySelector("#close-chat-button"),this.clearChatButton=this.shadow.querySelector("#clear-chat-button"),this.popOutChatButton=this.shadow.querySelector("#popout-chat-button"),this.continueCheckbox=this.shadow.querySelector("#continue-checkbox"),this.openChatButton=this.shadow.querySelector("#open-chat-button"),this.settingsButton=this.shadow.querySelector("#settings-button"),this.agentDropdownContainer=this.shadow.querySelector("#agent-dropdown-container"),this.agentDropdown=this.shadow.querySelector("#agent-dropdown")}_handleEnterKey(t){"Enter"===t.key&&(this._sendMessage(),t.preventDefault())}closeChat(){this.chatContainer.style.display="none",this.openChatButton.style.display="flex",this.agentDropdownContainer&&(this.agentDropdownContainer.style.display="none")}async _handlePopout(){"documentPictureInPicture"in window?await this._requestPictureInPicture():this._popout()}async _requestPictureInPicture(){if(!this.isPipRequestInProgress){this.isPipRequestInProgress=!0;let e=this.chatContainer.parentNode;try{this.isPipActive=!0,this.chatContainer.classList.add("pip-active-inline");this.shadow.querySelector("#chat-container");var t={width:380,height:502,lockAspectRatio:!0,copyStyleSheets:!0};let o=await documentPictureInPicture.requestWindow(t);[...document.styleSheets].forEach(e=>{try{var s=[...e.cssRules].map(t=>t.cssText).join(""),t=document.createElement("style");t.textContent=s,o.document.head.appendChild(t)}catch(t){s=document.createElement("link");s.rel="stylesheet",s.type=e.type,s.media=e.media,s.href=e.href,o.document.head.appendChild(s)}}),o.document.body.append(this.chatContainer),o.addEventListener("pagehide",t=>{this.isPipActive=!1,this.chatContainer.classList.remove("pip-active-inline"),e.appendChild(this.chatContainer),this.isPipRequestInProgress=!1,this._openChat()},{once:!0}),setTimeout(()=>{this._scrollToChatBottom()},100)}catch(t){console.error("Picture-in-Picture API error:",t),this._popout()}finally{this.isPipRequestInProgress=!1}}}_clearChatCache(){this._removeConversationCache()}_openChat(){this.chatContainer.style.display="flex",this.openChatButton.style.display="none";var t=JSON.parse(localStorage.getItem("cachedConversation_"+this.config.agentUUID));this.isChatOpen||!this.initialMessage||t||this._sendMessage(this.initialMessage),setTimeout(()=>{this._scrollToChatBottom()},100)}_toggleAgentDropdown(){this.agentDropdownContainer.style.display="block"===this.agentDropdownContainer.style.display?"none":"block"}_handleAgentChange(t){t=t.target.value;this._selectAgent(t,!0)}_setInitialState(){this.isChatOpen||this.isPipActive?(this.chatContainer.style.display="flex",this.openChatButton.style.display="none",this._scrollToChatBottom()):(this.chatContainer.style.display="none",this.openChatButton.style.display="block")}_popout(){window.open(window.location.href,"Agent Chat Popout","width=350,height=515,toolbar=0,location=0,menubar=0,status=0,scrollbars=0,resizable=0")}_selectAgent(t,e=!0){t&&(e&&localStorage.setItem("selectedAgent",t),this.config.agentUUID=t,this.requestBody.agent_uuid=t,this.chatMessages.innerHTML="",this.agentDropdownContainer.style.display="none",this._loadConversationCache())}_replaceActions(){var t=document.getElementsByTagName("loomlay-action");t&&Array.from(t).forEach(t=>{if(!t.innerHTML.includes("<button")&&!t.innerHTML.includes("<a")){var o=t.getAttribute("type"),n=t.getAttribute("text-color"),i=t.getAttribute("bg-color");let e=t.getAttribute("value");var a=t.innerHTML;let s;switch(o){case"btn":case"btn-sycnh":(s=document.createElement("button")).className="replybutton",s.textContent=a,s.addEventListener("click",t=>{console.log("Button Click - _sendStartMessage, value:",e,", event:",t),this._sendStartMessage(e,t)});break;case"btn-asynch":(s=document.createElement("button")).className="replybutton",s.textContent=a,s.addEventListener("click",t=>{console.log("Button Click - _sendAsyncStartMessage, value:",e,", event:",t),this._sendAsyncStartMessage(e,s,t)});break;case"link":case"link-sycnh":(s=document.createElement("span")).className="replylink",s.textContent=a,s.addEventListener("click",t=>{t.preventDefault(),console.log("Link Click - _sendStartMessage, value:",e,", event:",t),this._sendStartMessage(e,t)});break;case"link-asynch":(s=document.createElement("span")).className="replylink",s.textContent=a,s.addEventListener("click",t=>{t.preventDefault(),console.log("Link Click - _sendAsyncStartMessage, value:",e,", event:",t),this._sendAsyncStartMessage(e,s,t)});break;default:return}n&&(s.style.color=n),i&&(s.style.backgroundColor=i),s&&t.parentNode.replaceChild(s,t)}})}_sendStartMessage(t,e){console.log("_sendStartMessage called with message:",t,", type:",typeof t),this._sendMessage(t),this.chatContainer.style.display="flex",this.openChatButton.style.display="none"}_sendAsyncStartMessage(t,e,s){console.log("_sendAsyncStartMessage called with message:",t,", type:",typeof t);let o=e.textContent;e.textContent="Processing...",this.openChatButton.innerHTML=`<img src="${this.cdnUrl}/images/ripples.svg" alt="Processing...">`;this._sendMessage(t,t=>{t.chatContainer.style.display="flex",t.openChatButton.style.display="none",t.openChatButton.innerHTML=`<img src="${t.cdnUrl}/images/chat_button.svg" class="open-chat-icon" alt="Chat Button">`,e.textContent=o})}_populateAgentDropdown(){var t;this.agentDropdown&&(this.agentList.forEach(t=>{var e=document.createElement("option");e.value=t.agent_uuid,e.textContent=t.agent_name,this.agentDropdown.appendChild(e)}),1<this.agentList.length)&&(t=localStorage.getItem("selectedAgent"),this.agentDropdown.value=t||this.agentList[0].agent_uuid)}_hideInitialPrompt(){this.shadow.getElementById("defaultbackground")?.remove()}_sendMessage(t,e){console.log("_sendMessage function - message received:",t,", type:",typeof t);let s="";if(void 0!==t)s=String(t).trim();else{if(!this.messageInput)return void console.error("Message input is not available.");s=this.messageInput.value.trim()}s?(this.requestBody.continue=this.continueCheckbox.checked,this.requestBody.context=s,this._appendMessage("user",s,!0),this.messageInput&&(this.messageInput.value=""),this._appendTypingIndicator(),this._setWaitingMessages(),this._fetchAgentResponse(e),this._hideInitialPrompt()):console.log("_sendMessage - userMessage is empty after processing.")}_fetchAgentResponse(e){var t={method:"POST",headers:{"Content-Type":"application/json","X-Auth-Token":this.config.authToken},body:JSON.stringify(this.requestBody)},s=this.config.apiEndpoint;this.isExtraLoggingEnabled&&this._logRequestDetails(s,t),fetch(s,t).then(t=>this._handleResponse(t)).then(t=>this._processResponseData(t,e)).catch(t=>this._handleError(t,e))}_logRequestDetails(t,e){this.isExtraLoggingEnabled&&(console.groupCollapsed("API Request Details"),console.log("Request URL:",t),console.log("Request Method:",e.method),console.log("Request Headers:",e.headers),console.log("Request Body:",this.requestBody),console.groupEnd())}_handleResponse(t){if(this._removeTypingIndicator(),this.isExtraLoggingEnabled&&this._logResponseDetails(t),t.ok)return t.json();throw this.isExtraLoggingEnabled&&(console.error("HTTP Error Response:",t),console.groupEnd()),new Error("HTTP error! status: "+t.status)}_logResponseDetails(t){this.isExtraLoggingEnabled&&(console.groupCollapsed("API Response Details"),console.log("Response Status:",t.status),console.log("Response Headers:",t.headers))}_processResponseData(t,e){this.isExtraLoggingEnabled&&(console.log("Response Body (JSON):",t),console.groupEnd());var s=t.agent_message||"No response from agent";this.requestBody.key=t.key,this._cacheConversationKey(t.key),this._appendMessage("agent",s,!0),this._clearWaitingMessages(),e?.(this)}_handleError(t,e){e?.(this),this._clearWaitingMessages(),this._removeTypingIndicator(),this.isExtraLoggingEnabled&&this._logErrorDetails(t),console.error("Error:",t),this._appendError("Error getting a response from Loomlay. Please check your connection and try again.")}_logErrorDetails(t){this.isExtraLoggingEnabled&&(console.groupCollapsed("Fetch Error Details"),console.error("Fetch Error:",t),console.groupEnd())}_setWaitingMessages(){this.config.autoResponse&&this.automaticMessagesConfig.forEach(t=>{var e=setTimeout(()=>this._callWithAutomaticMessage(t.message),t.timeout);this.waitingMessagesTimers.push(e)})}_clearWaitingMessages(){Array.isArray(this.waitingMessagesTimers)?(this.waitingMessagesTimers.forEach(t=>clearTimeout(t)),this.waitingMessagesTimers=[]):console.warn("_clearWaitingMessages: waitingMessagesTimers is not an array, skipping clearTimeout."),this._clearAutomaticMessages()}_callWithAutomaticMessage(t){this._clearAutomaticMessages(),this._appendMessage("agent",t,!1,"automatic")}_clearAutomaticMessages(){Array.from(this.chatMessages.childNodes).forEach(t=>{t.id?.startsWith("automatic")&&this.chatMessages.removeChild(t)})}_formatMessage(t){t=t.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br>");return this._replacePatterns(t)}_appendMessage(t,e,s,o){console.log("_appendMessage - sender:",t,", message:",e,", type:",typeof e);e=String(e),s&&this._cacheMessage(t,e),s=document.createElement("div"),s.className=`message-container ${t}-message-container`,o&&(s.id=o+"_container"),o=document.createElement("div");o.className=`message ${t}-message`,o.innerHTML=this._formatMessage(e),s.appendChild(o),this.chatMessages.appendChild(s),setTimeout(()=>{this._scrollToChatBottom()},0)}_cacheMessage(t,e){var s="cachedConversation_"+this.config.agentUUID,o=JSON.parse(localStorage.getItem(s))||{key:null,messages:[]};o.messages.push({sender:t,message:e}),localStorage.setItem(s,JSON.stringify(o))}_cacheConversationKey(t){var e="cachedConversation_"+this.config.agentUUID,s=JSON.parse(localStorage.getItem(e))||{key:null,messages:[]};s.key=t,localStorage.setItem(e,JSON.stringify(s))}_removeConversationCache(){localStorage.removeItem("cachedConversation_"+this.config.agentUUID),this.requestBody=this._getDefaultRequestBodyConfig(),this.chatMessages.innerHTML=`<div id="defaultbackground" class="default-background"><img src="${this.cdnUrl}/images/default.svg" alt="Default Background"><br/><br/></div>`}_getDefaultRequestBodyConfig(){return{agent_uuid:this.config.agentUUID,context:null,extra_context:null,continue:!0,key:null,extra_params:null}}navigate(t){window.location.href=t}createElement(t,e,s,o){let n;if("btn"===t)(n=document.createElement("button")).className="replybutton";else{if("link"!==t)return console.error('Invalid type. Use "btn" for button or "link" for anchor tag.'),"";(n=document.createElement("span")).href="#",n.className="replylink"}return n.textContent=o,"prompt"===e?(n.setAttribute("data-context",s),n.setAttribute("data-action","prompt")):"open-new"===e?(n.setAttribute("data-url",s),n.setAttribute("data-action","open-new")):"open-current"===e&&(n.setAttribute("data-url",s),n.setAttribute("data-action","open-current")),n.outerHTML}_replacePatterns(t){return t.replace(/\[(btn|link)\|(.*?)\|(.*?)\|(.*?)\]/g,(t,e,s,o,n)=>this.createElement(e,s,o,n)||t)}_loadConversationCache(){var t="cachedConversation_"+this.config.agentUUID,t=JSON.parse(localStorage.getItem(t));t?.messages?.length?(this.requestBody.key=t.key,this._hideInitialPrompt(),t.messages.forEach(t=>{this._appendMessage(t.sender,t.message,!1)}),this._scrollToChatBottom()):this.chatMessages.innerHTML=`<div id="defaultbackground" class="default-background"><img src="${this.cdnUrl}/images/default.svg" alt="Default Background"><br/><br/></div>`}_appendTypingIndicator(){var t=document.createElement("div"),e=(t.className="message-container agent-message-container agent-typing-message",t.id="agent-typing-message-container",document.createElement("div"));e.className="message agent-message",e.innerHTML='<div id="agent-typing-dots" class="agent-typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>',t.appendChild(e),this.chatMessages.appendChild(t),this.chatMessages.scrollTop=this.chatMessages.scrollHeight}_removeTypingIndicator(){this.chatMessages.querySelector("#agent-typing-message-container")?.remove()}_appendError(t){this._removeError(),this._removeTypingIndicator();var e=document.createElement("div"),s=(e.className="message-container agent-message-container error-message",document.createElement("div"));s.className="message agent-message",s.textContent=t,e.appendChild(s),this.chatMessages.appendChild(e),this.chatMessages.scrollTop=this.chatMessages.scrollHeight}_removeError(){this.chatMessages.querySelector(".error-message")?.remove()}}customElements.define("loomlay-chat",t)})();
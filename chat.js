(function () {
    class LoomlayChatWidget extends HTMLElement {
        constructor() {
            super();
            this.shadow = this.attachShadow({ mode: 'open' });

            this.loomlayConfig = {
                apiEndpoint: "https://api.loomlay.com/api:sDfF41c6/conversation/create",
                authToken: "some_token", // **REPLACE WITH YOUR ACTUAL TOKEN**
                agentUUID: "01876f7a09b24a43b76fe0fcd4daeee5", // Default agent, will be overridden if agents are defined
                accessKey: null, // Kept for potential future use, though currently not used as requested
                chatTitle: "Loomlay Chat",
                closeButtonColour: "#2773747",
                sendButtonColor: "#2773747",
                switchButtonColor: "#2773747",
                headerColor: "#2773747",
                footerColor: "#2773747",
                bodyColor: "#2773747",
                messageInputColor: "#2773747",
                openChatButtonColor: "#2773747",
                extraContext: null,
                context: "",
                autoResponse: false
            };
            this.requestBody = {
                agent_uuid: this.loomlayConfig.agentUUID,
                context: null,
                extra_context: null,
                continue: true,
                key: null,
                extra_params: null,
            };

            this.extraLoggingEnabled = true;
            this.agentList = []; // To store fetched agent list
            this.settingsEnabled = false; // Initially settings are off
            this.pipActive = false;
            this.pipRequestInProgress = false;
            this.waitingMessages = [];
            this.automaticeMessages = [
                { "message": "your request recieved", "timeout": 5000 },
                { "message": "analyzing the data", "timeout": 10000 },
                { "message": "preparing the answer", "timeout": 20000 }
            ];
            this.isOpen = true;
            this.initialMessage = "";
            this.extraParams = "";
            this.cdnUrl = "https://cdn.jsdelivr.net/gh/loomlayorg/widget-public@main"; // Define CDN URL
        }

        connectedCallback() {
            this.replaceLoomlayAction();
            this.chatTitle = this.getAttribute('title') || this.loomlayConfig.chatTitle; // Use attribute title or default
            this.closeButtonColour = this.getAttribute('closeButtonColour') || this.loomlayConfig.closeButtonColour;
            this.sendButtonColor = this.getAttribute('sendButtonColor') || this.loomlayConfig.sendButtonColor;
            this.switchButtonColor = this.getAttribute('switchButtonColor') || this.loomlayConfig.switchButtonColor;
            this.headerColor = this.getAttribute('headerColor') || this.loomlayConfig.headerColor;
            this.footerColor = this.getAttribute('footerColor') || this.loomlayConfig.footerColor;
            this.bodyColor = this.getAttribute('bodyColor') || this.loomlayConfig.bodyColor;
            this.messageInputColor = this.getAttribute('messageInputColor') || this.loomlayConfig.messageInputColor;
            this.openChatButtonColor = this.getAttribute('openChatButtonColor') || this.loomlayConfig.openChatButtonColor;
            this.autoResponse = this.getAttribute('auto-response') == 'true' || this.loomlayConfig.autoResponse;
            this.isOpen = this.getAttribute('isOpen') == 'true' || this.loomlayConfig.isOpen;
            this.initialMessage = this.getAttribute('initial-message') || this.loomlayConfig.initialMessage;

            const automaticeMessages = this.querySelector('automaticResponseMessages');
            if (automaticeMessages && automaticeMessages.childNodes && automaticeMessages.childNodes.length > 0) {
                var messages = automaticeMessages.querySelectorAll("message");
                if (messages && messages.length > 0) {
                    this.automaticeMessages = [];
                    for (var i = 0; i < messages.length; i++) {
                        var currentNode = messages[i];
                        var timeOut = parseInt(currentNode.getAttribute("timeout"));
                        if (timeOut) {
                            this.automaticeMessages.push({ "message": currentNode.textContent, "timeout": timeOut });
                        }
                    }
                }
            }


            const extraContextElement = this.querySelector('userContext');
            if (extraContextElement && extraContextElement.innerHTML) {
                this.extraContext = extraContextElement.innerHTML;
            }
            else {
                this.extraContext = this.loomlayConfig.extraContext;
            }

            const extraParamsElement = this.querySelector('extraParams');
            if (extraParamsElement && extraParamsElement.innerHTML) {
                this.extraParams = extraParamsElement.innerHTML;
            }
            else {
                this.extraParams = this.loomlayConfig.extra_params;
            }

            this.context = this.getAttribute('context') || this.loomlayConfig.context;


            this.authToken = this.getAttribute('accesskey'); // Get the accessKey

            if (this.authToken) {
                this.loomlayConfig.authToken = this.authToken;
            }

            const agentsElement = this.querySelector('agents');
            let agentElements = [];
            if (agentsElement) {
                agentElements = Array.from(agentsElement.querySelectorAll('agent'));
            }

            if (agentElements.length > 1) {
                this.settingsEnabled = true; // Enable settings if more than one agent
            } else {
                this.settingsEnabled = false; // Disable settings otherwise
            }

            if (agentElements.length > 0) {
                // Set initial agent to the first one in the list
                var selectedAgent = localStorage.getItem("selectedAgent");
                if (selectedAgent != null) {
                    this.loomlayConfig.agentUUID = selectedAgent;
                    this.requestBody.agent_uuid = selectedAgent;
                }
                else {
                    this.loomlayConfig.agentUUID = agentElements[0].getAttribute('uuid');
                    this.requestBody.agent_uuid = this.loomlayConfig.agentUUID;
                }
            }

            if (this.extraContext != null && this.extraContext != "") {
                this.requestBody.extra_context = this.extraContext;
            }

            if (this.extraParams != null && this.extraParams != "") {
                this.requestBody.extra_params = JSON.parse(this.extraParams);
            }

            var checkedContext = "checked";
            var display = "none";
            if (this.context) {
                if (this.context == "0" || this.context.toLowerCase() == "off") {
                    checkedContext = "";
                }
                if (this.context.toLowerCase() == "select") {
                    checkedContext = "checked";
                    display = "block";
                }
            }

            let headerRightItemsHTML = `
                <div class="memory-container" style="display: ${display};">
                    <input type="checkbox" id="continue-checkbox" style="background-color: ${this.switchButtonColor};" class="memory-checkbox" ${checkedContext} >
                    <label for="continue-checkbox" class="memory-checkbox-label">Context</label>
                </div>
            `;

            let settingsButtonHTML = '';
            let agentDropdownHTML = '';
            let clearChatButton = '';
            clearChatButton = `<button id="clear-chat-button" style="background-color: ${this.closeButtonColour}" aria-label="Clear Chat">
                <img src="${this.cdnUrl}/images/tabler_refresh.svg">
                </button>
                `;

            let popOutChatButton = '';
            let displayPopOut = "block";
            if (this.pipActive || window.toolbar.visible == false) {
                displayPopOut = "none";
            }
            popOutChatButton = `<button id="popout-chat-button" style="background-color: ${this.closeButtonColour}; display: ${displayPopOut}" aria-label="PopOut Chat">
                <img src="${this.cdnUrl}/images/open_new_window.svg">
                </button>
                `;

            let closeChatButton = '';
            let displayClose = "block";
            if (this.pipActive || window.toolbar.visible == false) {
                displayClose = "none";
            }
            closeChatButton = `<button id="close-chat-button" style="background-color: ${this.closeButtonColour}; display: ${displayClose}" aria-label="Close Chat">
                <img src="${this.cdnUrl}/images/close.svg">
                </button>
                `;
            if (this.settingsEnabled) {
                let settingsButton = '';
                let displaySettingsButton = "block";
                if (this.pipActive || window.toolbar.visible == false) {
                    displaySettingsButton = "none";
                }

                settingsButtonHTML = `<button id="settings-button" style="display: ${displaySettingsButton}" aria-label="Settings">
                <img src="${this.cdnUrl}/images/settings.svg">
                </button>
                `; // "Settings" text

                agentDropdownHTML = `
                    <div id="agent-dropdown-container">
                        <select class="mainselection" id="agent-dropdown">
                            <option value="" disabled selected>Select Agent</option>
                        </select>
                    </div>
                `;

            }
            headerRightItemsHTML = headerRightItemsHTML + settingsButtonHTML + popOutChatButton + clearChatButton + closeChatButton;

            var positionChatContainer = "fixed";
            var borderRadius = "10px";
            if (this.pipActive || window.toolbar.visible == false) {
                var positionChatContainer = "";
                var borderRadius = "0";

            }
//TBD remove hardcode style="height:12px"
            this.shadow.innerHTML = `
                <style>
                    @import url('${this.cdnUrl}/chat.css');
                </style>
                <div id="chat-container" style="position: ${positionChatContainer}; border-radius: ${borderRadius}">
                    <div style="background-color: ${this.headerColor}" id="chat-header">
                        <div>
                        <img style="height:12px" src="${this.cdnUrl}/images/logo.svg"></img>
                        <span>${this.chatTitle}</span>
                        </div>
                        <div id="header-right-items">
                            ${headerRightItemsHTML}
                        </div>
                        ${agentDropdownHTML}
                    </div>
                    <div id="chat-messages" style="background-color: ${this.bodyColor}"><div id="defaultbackground"><img src="${this.cdnUrl}/images/default.svg"></img><br/><br/></div></div>
                    <div id="chat-input" style="background-color: ${this.footerColor}">
                        <input type="text" id="message-input" style="background-color: ${this.messageInputColor}" placeholder="Type your message...">
                        <button id="send-button" style="background-color: ${this.sendButtonColor}"><img src="${this.cdnUrl}/images/chat_input.svg"></img>
                        </button>
                    </div>
                </div>
                <button id="open-chat-button" style="background: ${this.openChatButtonColor}">
                <img src="${this.cdnUrl}/images/chat_button.svg"></img>
                </button>
            `;

            this.chatContainer = this.shadow.querySelector("#chat-container");
            this.chatHeader = this.shadow.querySelector("#chat-header");
            this.chatMessages = this.shadow.querySelector("#chat-messages");
            this.messageInput = this.shadow.querySelector("#message-input");
            this.sendButton = this.shadow.querySelector("#send-button");
            this.closeChatButton = this.shadow.querySelector("#close-chat-button");
            this.clearChatButton = this.shadow.querySelector("#clear-chat-button");
            this.popOutChatButton = this.shadow.querySelector("#popout-chat-button");
            this.continueCheckbox = this.shadow.querySelector("#continue-checkbox");
            this.openChatButton = this.shadow.querySelector("#open-chat-button");
            this.settingsButton = this.shadow.querySelector("#settings-button");
            this.agentDropdownContainer = this.shadow.querySelector("#agent-dropdown-container");
            this.agentDropdown = this.shadow.querySelector("#agent-dropdown");

            this.messageInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    this.sendMessage();
                    event.preventDefault(); // Prevent default form submission
                }
            });

            this.closeChatButton.addEventListener("click", () => {
                this.chatContainer.style.display = "none";
                this.openChatButton.style.display = "flex";
                if (this.agentDropdownContainer) {
                    this.agentDropdownContainer.style.display = "none"; // Hide dropdown if open
                }
            });

            this.popOutChatButton.addEventListener('click', async () => {
                if ("documentPictureInPicture" in window == true) {

                    const chat = document.querySelector("#block");

                    const pipOptions = { // Or videoElement.clientWidth / videoElement.clientHeight if you want video aspect
                        width: 380,
                        height: 500,
                        lockAspectRatio: true,
                        copyStyleSheets: true,
                    };
                    // Open a Picture-in-Picture window.
                    const pipWindow = await documentPictureInPicture.requestWindow(pipOptions);

                    // Move the player to the Picture-in-Picture window.

                    // Copy style sheets over from the initial document
                    [...document.styleSheets].forEach((styleSheet) => {
                        try {
                            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
                            const style = document.createElement("style");

                            style.textContent = cssRules;
                            pipWindow.document.head.appendChild(style);
                        } catch (e) {
                            const link = document.createElement("link");

                            link.rel = "stylesheet";
                            link.type = styleSheet.type;
                            link.media = styleSheet.media;
                            link.href = styleSheet.href;
                            pipWindow.document.head.appendChild(link);
                        }
                    });
                    this.pipActive = true;
                    pipWindow.document.body.append(chat);

                    pipWindow.addEventListener("pagehide", (event) => {
                        const playerContainer = document.body; // Changed to document.body as it's a popout
                        const pipPlayer = event.target.querySelector("#block");
                        this.pipActive = false;
                        playerContainer.append(pipPlayer);
                    });

                }
                else {
                    this.popoutChat();
                }
            });

            this.clearChatButton.addEventListener("click", () => {
                this.removeConversationFromCache();
            });

            this.openChatButton.addEventListener("click", () => {
                this.chatContainer.style.display = "flex";
                this.openChatButton.style.display = "none";

                var cachedConversation = JSON.parse(localStorage.getItem("cachedConversation"));
                if (this.isOpen !== true && this.initialMessage != "" && cachedConversation == null) {
                    this.sendMessage(this.initialMessage);
                }
            });

            this.sendButton.addEventListener("click", () => this.sendMessage());

            if (this.settingsEnabled && this.settingsButton && this.agentDropdownContainer) {
                this.settingsButton.addEventListener("click", () => {
                    this.agentDropdownContainer.style.display = this.agentDropdownContainer.style.display === "block" ? "none" : "block";
                });
            }

            if (this.settingsEnabled && this.agentDropdown) {
                this.populateAgentDropdownFromHTML();
                if (this.agentList && this.agentList.length > 1) {
                    var selectedAgent = localStorage.getItem('selectedAgent');
                    if (selectedAgent != null) {
                        this.agentDropdown.value = selectedAgent;
                    }
                    else {
                        this.agentDropdown.value = this.agentList[0].agent_uuid;
                    }
                }

                this.agentDropdown.addEventListener('change', (event) => {
                    const selectedAgentUUID = event.target.value;
                    this.selectAgent(selectedAgentUUID, true);
                });
            }

            this.loadConversationFromCacheIfExists();

            if (this.isOpen || this.pipActive) {
                this.chatContainer.style.display = "flex";
                this.openChatButton.style.display = "none";
            }
            else {
                this.chatContainer.style.display = "none";
                this.openChatButton.style.display = "block";
            }
        }


        popoutChat() {
            window.open(
                window.location.href,
                "Agent Chat Popout",
                "width=350,height=515,toolbar=0,location=0,menubar=0,status=0,scrollbars=0,resizable=0"
            );
        }

        selectAgent(selectedAgentUUID, putToCache) {
            if (selectedAgentUUID) {
                if (putToCache == true) {
                    localStorage.setItem("selectedAgent", selectedAgentUUID);
                }
                this.loomlayConfig.agentUUID = selectedAgentUUID;
                this.requestBody.agent_uuid = selectedAgentUUID;
                this.chatMessages.innerHTML = '';
                this.agentDropdownContainer.style.display = "none";
                this.loadConversationFromCacheIfExists();
            }
        }

        replaceLoomlayAction() {
            var elements = document.getElementsByTagName("loomlay-action");

            window.context = this;
            if (elements && elements.length > 0) {
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element.innerHTML.indexOf("<button") > -1 || element.innerHTML.indexOf("<a") > -1) {
                        continue;
                    };
                    var type = element.getAttribute("type");
                    var action = element.getAttribute("action");
                    var value = element.getAttribute("value");
                    var text = element.innerHTML;
                    if (type == "btn" || type == "btn-sycnh") {
                        var button = "<button class='replybutton' onclick=\"context.sendStartMessage('" + value + "')\">" + text + "</button>";
                        element.innerHTML = button;
                    }
                    if (type == "btn-asynch") {
                        var button = "<button class='replybutton' onclick=\"context.sendAsynchStartMessage('" + value + "', this)\">" + text + "</button>";
                        element.innerHTML = button;
                    }

                    if (type == "link" || type == "link-sycnh") {
                        var a = "<a href='#' onclick=\"context.sendStartMessage('" + value + "')\">" + text + "</a>";
                        element.innerHTML = a;
                    }

                    if (type == "link-asynch") {
                        var a = "<a href='#' onclick=\"context.sendAsynchStartMessage('" + value + "', this)\">" + text + "</a>";
                        element.innerHTML = a;
                    }
                }
            }
        }

        sendStartMessage(message) {
            this.sendMessage(message);
            this.chatContainer.style.display = "flex";
            this.openChatButton.style.display = "none";
        }

        sendAsynchStartMessage(message, button) {
            var originalText = button.innerHTML;
            button.innerHTML = "Processing...";
            context.openChatButton.innerHTML = `<img src="${this.cdnUrl}/images/ripples.svg"></img>`;
            var callback = function callbackAsynchStartMessage(context) {
                context.chatContainer.style.display = "flex";
                context.openChatButton.style.display = "none";
                context.openChatButton.innerHTML = `<img src="${this.cdnUrl}/images/chat_button.svg"></img>`;
                button.innerHTML = originalText;
            };
            this.sendMessage(message, callback);
        }




        populateAgentDropdownFromHTML() {
            const agentsElement = this.querySelector('agents');
            if (!agentsElement) {
                console.warn("No <agents> tag found in loomlay-chat element.");
                return;
            }

            const agentElements = agentsElement.querySelectorAll('agent');
            if (!agentElements || agentElements.length === 0) {
                console.warn("No <agent> tags found within <agents>.");
                return;
            }

            agentElements.forEach(agentElem => {
                const agent = {
                    agent_uuid: agentElem.getAttribute('uuid'),
                    agent_name: agentElem.getAttribute('name'),
                    agent_description: agentElem.getAttribute('description')
                };
                if (agent.agent_uuid && agent.agent_name) {
                    this.agentList.push(agent);

                    const option = document.createElement('option');
                    option.value = agent.agent_uuid;
                    option.textContent = agent.agent_name;
                    this.agentDropdown.appendChild(option);
                }
            });
        }


        hideInitialPrompt = () => {
            const promptElement = this.shadow.getElementById('defaultbackground');
            if (promptElement) {
                promptElement.remove();
            }
        };

        sendMessage(message, callback) {
            const userMessage = message ? message : this.messageInput.value;
            if (userMessage.trim() === "") return;

            this.requestBody.continue = this.continueCheckbox.checked;
            let contextMessage = userMessage;


            this.requestBody.context = contextMessage;

            this.appendMessage("user", userMessage, true);
            this.messageInput.value = "";

            this.appendAgentTypingMessage();

            const fetchOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": this.loomlayConfig.authToken,
                },
                body: JSON.stringify(this.requestBody),
            };

            const apiUrl = this.loomlayConfig.apiEndpoint;

            if (this.extraLoggingEnabled) {
                console.groupCollapsed('API Request Details');
                console.log('Request URL:', apiUrl);
                console.log('Request Method:', fetchOptions.method);
                console.log('Request Headers:', fetchOptions.headers);
                console.log('Request Body:', this.requestBody);
                console.groupEnd();
            }

            this.setWaitingMessages();

            fetch(apiUrl, fetchOptions)
                .then((response) => {
                    this.removeAgentTypingMessage();

                    if (this.extraLoggingEnabled) {
                        console.groupCollapsed('API Response Details');
                        console.log('Response Status:', response.status);
                        console.log('Response Headers:', response.headers);
                    }

                    if (!response.ok) {
                        if (this.extraLoggingEnabled) {
                            console.error('HTTP Error Response:', response);
                            console.groupEnd();
                        }
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    return response.json().then(data => {
                        if (this.extraLoggingEnabled) {
                            console.log('Response Body (JSON):', data);
                            console.groupEnd();
                        }
                        return data;
                    });
                })
                .then((data) => {
                    const agentReply = data.agent_message || "No response from agent";
                    this.requestBody.key = data.key;
                    this.addKeyToConversationCache(data.key);
                    this.appendMessage("agent", agentReply, true);
                    this.clearWaitingMessages();

                    if (callback) {
                        callback(this);
                    }

                })
                .catch((error) => {
                    if (callback) {
                        callback(this);
                    }
                    this.clearWaitingMessages();
                    this.removeAgentTypingMessage();
                    if (this.extraLoggingEnabled) {
                        console.groupCollapsed('Fetch Error Details');
                        console.error('Fetch Error:', error);
                        console.groupEnd();
                    }
                    console.error("Error:", error);
                    this.appendErrorMessage("Error getting a response from Loomlay. Please check your connection and try again.");
                });

            this.hideInitialPrompt();
        }


        setWaitingMessages() {
            if (this.autoResponse) {
                var context = this;
                for (var i = 0; i < this.automaticeMessages.length; i++) {
                    let messageConfig = this.automaticeMessages[i];
                    this.waitingMessages.push(setTimeout(function () { context.callWithMessage(messageConfig.message) }, messageConfig.timeout));
                }
            }
        }

        clearWaitingMessages() {
            if (this.waitingMessages.length > 0) {
                for (var i = 0; i < this.waitingMessages.length; i++) {
                    clearTimeout(this.waitingMessages[i]);
                }
                this.waitingMessages = [];
            }
            this.clearAutomaticMessages();
        }

        callWithMessage(message) {
            this.clearAutomaticMessages();
            this.appendMessage("agent", message, false, "automatic");
        }

        clearAutomaticMessages() {
            for (var i = 0; i < this.chatMessages.childNodes.length; i++) {
                if (this.chatMessages.childNodes[i].id && this.chatMessages.childNodes[i].id.indexOf("automatic") > -1) {
                    this.chatMessages.removeChild(this.chatMessages.childNodes[i]);
                }
            }
        }

        convertToCorrectHtml(message) {
            var result = message.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            result = this.replacePatternWithElements(result)
            return result;
        }

        appendMessage(sender, message, shouldBeAddedToCache, id) {
            if (shouldBeAddedToCache === true) {
                this.addMessageToCache(sender, message);
            }
            const messageContainer = document.createElement('div');
            if (id) {
                messageContainer.setAttribute("id", id + "_container");
            }
            messageContainer.classList.add('message-container', `${sender}-message-container`);
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', `${sender}-message`);
            messageDiv.innerHTML = this.convertToCorrectHtml(message);

            messageContainer.appendChild(messageDiv);
            this.chatMessages.appendChild(messageContainer);
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            this.removeErrorMessage();
        }

        addMessageToCache(sender, message) {
            var cachedConversation = JSON.parse(localStorage.getItem("cachedConversation_" + this.loomlayConfig.agentUUID));
            if (!cachedConversation) {
                cachedConversation = {
                    "key": null,
                    "messages": null
                }
            }

            if (!cachedConversation.messages) {
                cachedConversation.messages = [];
            }

            cachedConversation.messages.push({
                "sender": sender,
                "message": message,
            });

            localStorage.setItem("cachedConversation_" + this.loomlayConfig.agentUUID, JSON.stringify(cachedConversation));
        }

        addKeyToConversationCache(key) {
            var cachedConversation = JSON.parse(localStorage.getItem("cachedConversation_" + this.loomlayConfig.agentUUID));
            cachedConversation.key = key;
            localStorage.setItem("cachedConversation_" + this.loomlayConfig.agentUUID, JSON.stringify(cachedConversation));
        }

        removeConversationFromCache() {
            localStorage.removeItem("cachedConversation_" + this.loomlayConfig.agentUUID);
            this.requestBody = {
                agent_uuid: this.loomlayConfig.agentUUID,
                context: null,
                extra_context: null,
                continue: true,
                key: null,
                extra_params: null,
            };
            this.chatMessages.innerHTML = `<div id="defaultbackground"><img src="${this.cdnUrl}/images/default.svg"></img><br/><br/></div>`;

        }

        navigate(url) {
            window.location.href = url;
        }

        createElement(type, action, context, label) {
            let onClick = "";
            if (action == "prompt") {
                onClick = "onclick =\"context.sendStartMessage('" + context + "')\"";
            }
            if (action == "open-new") {
                onClick = "onclick =\"window.open('" + context + "', '_blank')\"";
            }
            if (action == "open-current") {
                onClick = "onclick =\"window.open('" + context + "', '_self')\"";
            }

            if (type === 'btn') {
                return "<button class='replybutton'" + onClick + ">" + label + "</button>";
            } else if (type === 'link') {
                return "<a href='#' " + onClick + ">" + label + "</a>";
            } else {
                console.error('Invalid type. Use "btn" for button or "link" for anchor tag.');
                return null;
        }
    }

    replacePatternWithElements(text) {
        return text.replace(/\[(btn|link)\|(.*?)\|(.*?)\|(.*?)\]/g, (match, type, action, context, label) => {
            var element = this.createElement(type, action, context, label);
            return element ? element : text;
        });
    }

        loadConversationFromCacheIfExists() {
            var cachedConversation = JSON.parse(localStorage.getItem("cachedConversation_" + this.loomlayConfig.agentUUID));
            if (cachedConversation && cachedConversation.messages && cachedConversation.messages.length > 0) {
                this.requestBody.key = cachedConversation.key;
                this.hideInitialPrompt();
                for (var i = 0; i < cachedConversation.messages.length; i++) {
                    var cachedMessage = cachedConversation.messages[i];
                    this.appendMessage(cachedMessage.sender, cachedMessage.message, false);
                }
            }
            else {
                this.chatMessages.innerHTML = `<div id="defaultbackground"><img src="${this.cdnUrl}/images/default.svg"></img><br/><br/></div>`;
            }
        }

        appendAgentTypingMessage() {
            const messageContainer = document.createElement('div');
            messageContainer.classList.add('message-container', 'agent-message-container', 'agent-typing-message');
            messageContainer.id = 'agent-typing-message-container';
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'agent-message');
            messageDiv.innerHTML = `<div id="agent-typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
            messageContainer.appendChild(messageDiv);

            this.chatMessages.appendChild(messageContainer);
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }

        removeAgentTypingMessage() {
            const typingMessage = this.chatMessages.querySelector('#agent-typing-message-container');
            if (typingMessage) {
                this.chatMessages.removeChild(typingMessage);
            }
        }


        appendErrorMessage(errorMessage) {
            this.removeErrorMessage();
            this.removeAgentTypingMessage();
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('message-container', 'agent-message-container', 'error-message');

            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'agent-message');
            messageDiv.textContent = errorMessage;
            errorDiv.appendChild(messageDiv);

            this.chatMessages.appendChild(errorDiv);
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }

        removeErrorMessage() {
            const existingError = this.chatMessages.querySelector('.error-message');
            if (existingError) {
                this.chatMessages.removeChild(existingError);
            }
        }


        getFullConversation() {
            let fullConversation = "";
            const messages = this.chatMessages.querySelectorAll('.message');
            messages.forEach(message => {
                if (!message.classList.contains('error-message') && !message.parentNode.classList.contains('agent-typing-message-container')) {
                    fullConversation += message.textContent + "\n";
                }
            });
            return fullConversation.trim();
        }
    }

    customElements.define('loomlay-chat', LoomlayChatWidget);

})();
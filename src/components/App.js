import '../utils/websocket.js'

import AppWelcome from './AppWelcome';
import Chat from './chat/Chat';
import Conversation from '../models/Conversation';
import ConversationService from '../services/ConversationService';
import ConversationsList from './conversations/ConversationsList';
import { IoArrowBackOutline } from 'react-icons/io5'
import Message from '../models/Message';
import React from 'react';
import WebSocketConnection from '../utils/websocket.js';
import { isMobileScreen } from '../utils/window-size-utils.js';

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            user: props.user,
            setUserStatus: props.setUserStatus,
            conversations: [],
            targetConversation: null,
            setHeaderIcon: props.setHeaderIcon,
            setOnHeaderIconClick: props.setOnHeaderIconClick,
            resetHeaderIcon: props.resetHeaderIcon,
        }

        this.setConversations();
    }

    setConversations = async () => {
        const conversations = await ConversationService.getUserConversations()
        if (conversations) {
            this.setState({ conversations: conversations.reverse() });
        }
        else this.setState({ conversations: [] });
    }

    updateConversation = (newState) => {
        const conversations = this.state.conversations;
        const toUpdate = conversations.filter(conv => conv.id === newState.id)[0];
        if (toUpdate) {
            const index = conversations.indexOf(toUpdate);
            conversations[index] = newState;
        }
        this.setState({ conversations: conversations });
    }

    subscriptionMessageCallback = (plainMessage) => {
        let message = new Message(JSON.parse(plainMessage.body))

        const toUpdate = this.state.conversations.filter((conv) => conv.id === message.conversationId)[0];
        if (!toUpdate) {
            console.warn("Received a message that could not be applied to any existing conversation.")
            return;
        }
        else {
            toUpdate.messages.unshift(message);
            this.updateConversation(toUpdate);
        }
    }

    subscriptionConversationCallback = (plainConversation) => {
        let conversation = new Conversation(JSON.parse(plainConversation.body))

        if (!conversation) {
            console.warn("Received an invalid conversation from the subscription.")
            return;
        }
        else {
            const conversations = this.state.conversations;
            conversations.unshift(conversation);
            this.setState({ conversations: conversations });
        }
    }

    connectionStatusChangeCallback = (isConnected) => {
        if (isConnected)
            this.state.setUserStatus('online')
        else
            this.state.setUserStatus('offline')
    }

    async handleConversationSelection(conversation) {
        let messages = await ConversationService.getConversationMessages(conversation.id);
        let target = this.state.conversations
            .filter(conv => conv.id === conversation.id)[0]
        if (messages)
            target.messages = messages;
        else
            target.messages = []
        this.setState({ targetConversation: new Conversation(target) })

        if (isMobileScreen()) {
            this.setState({ isConversationsListHiden: true })
            this.state.setHeaderIcon(<IoArrowBackOutline />)
            this.state.setOnHeaderIconClick(() => this.backToList.bind(this));
        }
    }

    backToList = () => {
        this.state.resetHeaderIcon();
        this.setState({ isConversationsListHiden: false })
    }

    render() {
        return (
            <div className="logged" style={this.props.styles}>
                <WebSocketConnection topicId={this.state.user.profile.id} subscriptionMessageCallback={this.subscriptionMessageCallback.bind(this)} subscriptionConversationCallback={this.subscriptionConversationCallback.bind(this)} statusChangeCallback={this.connectionStatusChangeCallback.bind(this)} />
                {!this.state.isConversationsListHiden && <ConversationsList user={this.state.user} conversations={this.state.conversations} select={this.handleConversationSelection.bind(this)} />}
                {this.state.targetConversation ?
                    <Chat user={this.state.user} conversation={this.state.targetConversation} updateConversation={this.updateConversation.bind(this)}></Chat> :
                    <AppWelcome />}
            </div >

        )
    }
}


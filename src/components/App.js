import './App.css'
import { Component } from "react";
import Chat from './Chat';
import ConversationsList from './ConversationsList';
import { getMessagesWith, getUsernameById } from '../utils/fetch'

export default class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            conversations: [],
            user: props.user,
            setUser: props.setUser,
            setUserStatus: props.setUserStatus,
            targetFriend: null
        }
    }

    async handleFriendSelection(friend) {
        let messagess = await getMessagesWith(this.state.user.id, friend.id);
        if (!this.state.conversations.some((con) => con.friend === friend)) {
            this.setState({
                conversations: [{ friend: friend, messages: messagess }, ...this.state.conversations]
            })
        }
        this.setState({
            targetFriend: friend
        })

    }

    login = async (e) => {
        e.preventDefault();

        const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
        const userId = e.target[0].value

        if (uuidRegex.test(userId)) {
            let username = await getUsernameById(userId)
            let user = {
                id: userId,
                name: username
            }
            this.setState({ user: user })
            this.state.setUser(user);
        } else {
            throw new Error("Wprowadzono nieprawidłowy UUID")
        }
    }

    render() {
        const login = (
            <div className="login">
                <form className="popup" onSubmit={this.login.bind(this)}>
                    <span>Zaloguj się do<strong>OurRoom!</strong></span>
                    <input type="text" name="user-id" id="user-id" placeholder="ID użytkownika" />
                    <button type="submit" id="submit">Zaloguj się</button>
                </form>
            </div>
        )

        const logged = (
            <div className="logged" >
                <ConversationsList select={this.handleFriendSelection.bind(this)} />
                <Chat user={this.state.user} target={this.state.targetFriend} conversations={this.state.conversations} setUserStatus={this.state.setUserStatus}></Chat>
            </div >
        )

        return (
            <div className="App">
                {this.state.user ? logged : login}
            </div>
        )
    }
}
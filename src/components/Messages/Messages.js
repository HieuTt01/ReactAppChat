import React from 'react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';




class Messages extends React.Component {

    state = {
        messagesRef: firebase.database().ref('messages'),
        privateMessagesRef: firebase.database().ref('privateMessages'),
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        messages: [],
        progressBar: false,
        messagesLoading: true,
        numUniqueUsers: '',
        searchTerm: '', 
        searchLoading: false,
        isChannelStarred: false,
        searchResults: [],
        privateChannel: this.props.isPrivateChannel,
        userRef: firebase.database().ref('users')
    }

    componentDidMount() {
        const { channel, user} = this.state;
        if (channel && user) {
            this.addListeners(channel.id);
            this.addUserStarsListener(channel.id, user.uid)
        }
    }

    addListeners = channelId => {
        this.addMessageListener(channelId);
    }

    addMessageListener = channelId => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({ 
                messages: loadedMessages,
                messagesLoading: false
            });
            this.countUniqueUser(loadedMessages);
            this.countUserPosts(loadedMessages);
        })
    }

    addUserStarsListener = (channelId, userId) => {
        this.state.userRef
        .child(userId)
        .child('starred')
        .once('value')
        .then(data => {
            if (data.val() !== null) {
                const channelIds = Object.keys(data.val());
                const prevStarred = channelIds.includes(channelId);
                this.setState({
                    isChannelStarred: prevStarred
                })
            }
        })
    }

    displayMessages = messages => (
        messages.length > 0 && messages.map( message => (
            <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
             />
        ))
    )

    countUniqueUser = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
        this.setState({ numUniqueUsers });

    }

    countUserPosts = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc ) {
                acc[message.user.name].count += 1;
            }else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc;
        }, {});
        this.props.setUserPosts(userPosts);
    }

    isProgressBar = percent => {
        if (percent >0) {
            this.setState({ processBar: true });
        } 
    }

    displayChannelName = channel => {
        return channel ? `${this.state.privateChannel ? '@' : '#'} ${channel.name}` : '';
    }  

    getMessagesRef = () => {
        const { messagesRef, privateMessagesRef, privateChannel } = this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    }

    handleSearchChange = event => {
        this.setState({
            searchTerm: event.target.value, 
            searchLoading: true
        },
        () => this.searchMessage()
        );
    }

    searchMessage = () => {
        const channelMessage = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi'); 
        const searchResults = channelMessage.reduce((acc, message) => {
             if (message && message.content.match(regex) || message.user.name.match(regex)) {
                 acc.push(message); 
             }
             return acc;
        }, []);
        this.setState({ searchResults });
        setTimeout(() => this.setState({ searchLoading: false }), 700);
    }

    handleStar = () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel());
    }

    starChannel = () => {
        if (this.state.isChannelStarred) {
            this.state.userRef
                .child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar: this.state.channel.createdBy.avatar
                        }
                    }
                })
        }else {
            this.state.userRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err => {
                    if (err !== null){
                        console.error(err);
                    }
                })
        }
    }

    render () {
        const { 
                messagesRef, 
                channel, 
                user, 
                messages,
                progressBar, 
                numUniqueUsers,
                searchTerm, 
                searchResults,
                searchLoading,
                privateChannel
                ,isChannelStarred,
            } = this.state;
        return (
            <React.Fragment>
                <MessagesHeader 
                    channelName = {this.displayChannelName(channel)}
                    numUniqueUsers = {numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                    isChannelStarred={isChannelStarred}
                    handleStar={this.handleStar}
                />
                <Segment>
                    <Comment.Group className={progressBar ? "message__progress": "messages"}>
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                <MessageForm 
                    messagesRef={messagesRef} 
                    currentChannel={channel}
                    currentUser={user}
                    isProgressBar={this.isProgressBar}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        )
    }
}

export default connect( null, { setUserPosts })(Messages);
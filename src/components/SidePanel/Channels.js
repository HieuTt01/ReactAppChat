import React from 'react';
import firebase from '../../firebase' ;
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import { Icon, Menu, Modal, Form, Button, Input, Label } from 'semantic-ui-react';




class Channels extends React.Component {
    state = {
        user: this.props.currentUser,
        channels: [],
        channel: null,
        channelName: '', 
        channelDetails: '',
        channelsRef: firebase.database().ref('channels'),
        messagesRef: firebase.database().ref('messages'),
        activeChannel: '',
        notifications: [],
        modal: false,
        firstLoad: true
    }

    openModal = () => this.setState({ modal: true });
    closeModal = () => this.setState({ modal: false });

    handleChange = event => {
        this.setState({ [event.target.name] : event.target.value });
    }

    handleSubmit = event => {
        event.preventDefault();
        if(this.isFormValid(this.state)) {
            this.addChannel();
        }
    }

    addChannel = () => {
        const { channelsRef, channelName, channelDetails, user } = this.state;
        const key = channelsRef.push().key;
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        };
        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({ channelName: '', channelDetails: '' });
                this.closeModal();
                console.log('Channel added!');
            })
            .catch(err => {
                console.error(err);
            });
    }

    isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails;

    componentDidMount() {
        this.addListeners();
    }

    componentWillUnmount() {
        this.removeListeners();
    }

    addListeners = () => {
        let loadChannels = [];
        this.state.channelsRef.on('child_added', snap =>{
            loadChannels.push(snap.val());
            this.setState({ channels: loadChannels }, () => this.setFirstChannel());
            this.addNotificationListener(snap.key);
        })
    }

    addNotificationListener = channelId => {
        this.state.messagesRef.child(channelId).on('value', snap => {
            if (this.state.channel) {
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap);
            }
        })
    }

    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;

        let index =notifications.findIndex(notification => notification.id === channelId)
        if (index !== -1 ) {
            if (channelId !== currentChannelId) {
                lastTotal= notifications[index].total;
                if (snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal;

                }

            }
            notifications[index].lastKnownTotal = snap.numChildren();
        }else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0 
            })
        }
        this.setState({ notifications });
    }

    getNotificationCount = channel => {
        let count = 0;
        this.state.notifications.forEach(notification => {
            if (notification.id  ===  channel.id) {
                count= notification.count
            }
        });
        if (count > 0) return count;
    }

    removeListeners = () => {
        this.state.channelsRef.off();
    }

    displayChannels = channels =>   (
        channels.length > 0 && channels.map(channel =>(
            <Menu.Item 
                key={channel.id} 
                onClick={() => this.changeChannels(channel)} 
                name={channel.name} 
                style={{opacity: 0.7}} 
                active={channel.id === this.state.activeChannel}
            >
                {this.getNotificationCount(channel) && (
                    <Label color="red">{this.getNotificationCount(channel)}</Label>
                )}
                # {channel.name}
            </Menu.Item>
        ))
    ) 

    changeChannels = channel => {
        this.setActiveChannel(channel);
        this.clearNotifications();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({ channel });
    }

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id);
        if (index !== -1 ) {
            let updatednotifications = [...this.state.notifications];
            updatednotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatednotifications[index].count = 0;
            this.setState({
                notifications: updatednotifications
            })
        }
    }

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];
        if (this.state.firstLoad  && this.state.channels.length > 0) {
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({ channel: firstChannel });
        }
        this.setState({ firstLoad: false});
    }

    setActiveChannel = channel => {
        this.setState({ activeChannel: channel.id});
    }




    render () {
        const { channels, modal } = this.state;
        return (
            <React.Fragment>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>{" "}
                            <Icon name="exchange" />Channels
                        </span>
                        ({ channels.length}) <Icon name="add" onClick={this.openModal}/>
                    </Menu.Item>
                    {this.displayChannels(channels)}
                </Menu.Menu>
                {/* Add Channels */}
                <Modal basic open = {modal} onClose = {this.closeModal}>
                    <Modal.Header>Add a Channel</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input fluid label="Name of Channel" name="channelName" onChange={this.handleChange} />
                            </Form.Field>
                            <Form.Field>
                                <Input fluid label="About the Channel" name="channelDetails" onChange={this.handleChange} />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark" /> Add
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove"  /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
           
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Channels);
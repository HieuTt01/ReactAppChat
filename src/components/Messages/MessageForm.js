import React from 'react';
import { Segment, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';
import uuidv4 from 'uuid/v4';
import { NimbleEmoji } from 'emoji-mart';



class MessageForm extends React.Component {

    state = {
        message: '',
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        errors: [],
        loading: false,
        modal: false,
        uploadState: '',
        uploadTask: null,
        percentUploaded: 0,
        storageRef: firebase.storage().ref()
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    }

    sendMessage = () => {
        const { getMessagesRef } = this.props;
        const { message, channel } = this.state;
        if (message) {
            this.setState({ loading: true });
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({ loading: false, message: '', errors: [] })
                })
                .catch(err => {
                    console.error(err);
                    this.setState({ loading: false, errors: this.state.errors.concat(err) })
                })
        }else {
            this.setState({
                errors: this.state.errors.concat({ message: 'Add a message' }) 
            })
        }
    }

    createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            },  
        };
        if (fileUrl !== null) {
            message['image'] = fileUrl;
        }else {
            message['content'] = this.state.message;
        }
        
        return message;
    }

    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat\private-${this.state.channel.id}`;
        }
        else {
            return `chat\public`;
        }
    }

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}${uuidv4()}.jpg`;
        this.setState({ 
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        },
        () => {
            this.state.uploadTask.on('state_changed' , snap => {
                const percentUploaded = Math.round((snap.bytesTransferred/ snap.totalBytes)*100);
                this.props.isProgressBar(percentUploaded);
                this.setState({ percentUploaded });
            },
            err => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err),
                    uploadState: 'error',
                    uploadTask: null
                })
            },
            () => {
                this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
                    this.sendFileMessage(downloadUrl, ref, pathToUpload);
                })
                .catch(err => {
                    console.error(err);
                    this.setState({
                        errors: this.state.errors.concat(err),
                        uploadState: 'error',
                         uploadTask: null
                    })
                })
            }  
            )
        }
        )
    }

    sendFileMessage  = (fileUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({ uploadState: 'done'})
            })
            .catch( err => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err)
                });
            })
    }

    openModal = () => this.setState({ modal: true });
    closeModal = () => this.setState({ modal: false });

    render() {
        const { errors, message, loading, modal, uploadState, percentUploaded } = this.state;
        return (
           <Segment className="message__form">
                <Input 
                    fluid name="message" 
                    style={{marginBottom: '0.7em'}} 
                    label={<Button icon={'add'}/>} 
                    labelPosition="left" 
                    value={message}
                    onChange={this.handleChange}
                    className={errors.some(error => error.message.includes('message')) ? 'error' : ''}
                    placeholder="Write your message"
                />
                <Button.Group icon widths="2">
                    <Button 
                        color="green" 
                        content="Add reply" 
                        onClick={this.sendMessage}
                        disabled={loading}
                        labelPosition="left" 
                        icon="edit"
                    />
                    <Button 
                        color="teal" 
                        content="Upload media" 
                        labelPosition="right" 
                        onClick={this.openModal}
                        disabled={uploadState==="uploading"}
                        icon="cloud upload"
                    />
                </Button.Group>
                    <FileModal 
                        modal={modal}
                        closeModal={this.closeModal}
                        uploadFile={this.uploadFile}
                    />
                    <ProgressBar
                        uploadState={uploadState}
                        percentUploaded={percentUploaded}
                     />
           </Segment>
        )
    }
}


export default MessageForm;
import React from 'react';
import './App.css';
import { Grid, Message, GridColumn, TableFooter } from 'semantic-ui-react';
import ColorPanel from './ColorPanel/ColorPanel';
import MetaPanel from './MetaPanel/MetaPanel';
import Messages from './Messages/Messages';
import SidePanel from './SidePanel/SidePanel';
import { connect } from 'react-redux';

const App = ({ currentUser, currentChannel, isPrivateChannel, userPosts }) => (
  <Grid columns="equal" className="app" style= {{background: '#eee'}}>
    <ColorPanel />
    <SidePanel 
      key={currentUser && currentUser.uid}
      currentUser = {currentUser} 

    />
    <Grid.Column style={{marginLeft: 320}}>
      <Messages 
        key={currentChannel && currentChannel.id}
        currentChannel = {currentChannel}
        currentUser = {currentUser}
        isPrivateChannel={isPrivateChannel}
      />
    </Grid.Column>
    <Grid.Column style={{width: 4}}>
      <MetaPanel 
        currentChannel = {currentChannel}
        isPrivateChannel={isPrivateChannel}
        key={currentChannel && currentChannel.id}
        userPosts={userPosts}
      />
    </Grid.Column>
    
  </Grid>
)

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts
})

export default connect(mapStateToProps)(App);

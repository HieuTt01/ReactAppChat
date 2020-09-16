import React from 'react';
import { GridColumn, Grid, Header, Icon, Dropdown, Image } from 'semantic-ui-react';
import firebase from '../../firebase';


class UserPanel extends React.Component {

    state = {
        user: this.props.currentUser

    }    


    dropdownOption= () => [
        {
            key: 'user',
            text: <span> Sign in as <strong>{this.state.user.displayName}</strong></span>,
            disabled: true
        },
        {
            key: 'avatar',
            text: <span>Change Avatar</span>
        },
        {
            key: 'singout',
            text: <span onClick={ this.handleSignout}>Sign Out</span>
        }
    ]

    handleSignout = () => {
        firebase
        .auth()
        .signOut()
        .then(() => console.log('signout'))

    }

    render() {
        const { user } = this.state;
        return (
            <Grid style={{ background: '#4c3c4c' }}>
                <Grid.Column>
                    <Grid.Row style={{ padding: '1.2em', margin: 0}}>
                    {/* App header */}
                        <Header inverted float="left" as="h2">
                            <Icon name="home" />
                            <Header.Content>Home 16</Header.Content>
                        </Header>
                    </Grid.Row>
                    {/* User dropdow */}
                    <Header style={{ padding: '0.25em'}} as="h4" inverted>
                        <Dropdown 
                            trigger={ 
                                <span>
                                    <Image src={user.photoURL} spaced="right" avatar />
                                    {user.displayName}

                                </span> 
                            } 
                            options={this.dropdownOption()}
                        />
                    </Header>
                </Grid.Column>

            </Grid>
        )
    }
}



export default UserPanel;
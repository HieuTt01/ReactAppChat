import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';




class Register extends React.Component {
    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
        errors: '',
        loading: false,
        regiterSuccess: false,
        usersRef: firebase.database().ref('users')
    };

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    }
    
    isFormEmpty = ({ username, email, password, passwordConfirm }) => {
        return !username.length || !email.length || !password.length || !passwordConfirm.length;
    }

    isPasswordValid = ({ password, passwordConfirm }) => {
        if (password.length < 6 ) {
            return false;
        }else if (password !== passwordConfirm ) {
            return false;
        }else {
            return true;
        }
    }

    isFormValid = () => {
        let errors = [];
        let error;
        if (this.isFormEmpty(this.state)) {
            //error
           error = { message: 'Fill in all fields!' };
           this.setState({ errors: errors.concat(error) });
           return false;
        }else if (!this.isPasswordValid(this.state)) {
            //error
            console.log(this.state.password.length);
            if (this.state.password.length < 6) {
                error = { message: 'Password requied more than 6 characters!' };
                this.setState({ errors: errors.concat(error) });
            }else {
                error = { message: 'Password is invalid!' };
                this.setState({ errors: errors.concat(error) });
            }
            return false;
        }else {
            //valid
            return true;
        }
    }

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message} </p>);

    saveUser = createdUser => {
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        });
    };

    handleSubmit = event => {
        event.preventDefault();
        if(this.isFormValid()){  
            this.setState({errors:[], loading: true});
            firebase   
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(createdUser => {
                    console.log(createdUser);
                    createdUser.user.updateProfile({
                        displayName: this.state.username,
                        photoURL: 'http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon'
                    })
                    .then(() => {
                        this.saveUser(createdUser).then(() =>{
                            console.log('user saved!');
                            this.setState({regiterSuccess:true, loading: false });
                        });
                    })
                    .catch(err =>{
                        console.error(err);
                        this.setState({errors: this.state.errors.concat(err),  loading: false});
                    });
                })
                .catch(err => {
                    console.error(err);
                    this.setState({errors: this.state.errors.concat(err),  loading: false});
                });
         }
        

    }

    // handleInputError = (errors, inputName) => {
    //     if (errors.some( error => error.message.toLowerCase().includes(inputName))) {
    //         return "error";
    //     }else {
    //         return "";
    //     }
    // }

    render() {
        const { username, email, password, passwordConfirm, errors,loading,regiterSuccess } = this.state;
        return (
            <Grid textAlign ="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as="h2" icon color="green" textAlign="center">
                        <Icon name="puzzle piece" color="green"/>
                        Register for Home16
                    </Header>
                    <Form onSubmit= {this.handleSubmit} size="large">
                        <Segment stacked>
                            <Form.Input fluid name="username" icon="user" iconPosition="left"
                            placeholder ="Username" onChange={this.handleChange} type="text" />

                             <Form.Input fluid name="email" icon="mail" iconPosition="left"
                            placeholder ="Email address" onChange={this.handleChange} type="email" 
                            />

                            <Form.Input fluid name="password" icon="lock" iconPosition="left"
                            placeholder ="Password" onChange={this.handleChange} type="password" 
                             />

                            <Form.Input fluid name="passwordConfirm" icon="repeat" iconPosition="left"
                            placeholder ="Password confirm" onChange={this.handleChange} type="password" />

                            <Button disabled={loading} className={loading? 'loading':''} color="green" fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 &&(
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    {regiterSuccess === true &&(
                        <Message success>
                            <h3>Success!</h3>
                        </Message>
                    )}
                    
                    <Message>
                        <Link className="backtoLogin" to="/login">Back To Login</Link>
                    </Message>
                </Grid.Column>

            </Grid>
        )
    }
}


export default Register;
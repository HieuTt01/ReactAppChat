import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';




class Login extends React.Component {
    state = {
        email: '',
        password: '',
        errors: '',
        loading: false
    };

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    }
    
    isFormEmpty = ({ email, password }) => {
        return !email.length || !password.length;
    }

  
    displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message} </p>);

    handleSubmit = event => {
        event.preventDefault();
        if(this.isFormValid(this.state)){  
            this.setState({errors:[], loading: true});
            firebase   
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then( signedInUser => {
                    console.log(signedInUser);
                })
                .catch(err =>{
                    console.error(err);
                    this.setState({errors: this.state.errors.concat(err),  loading: false});
                });
        };
    }
   
    isFormValid = ({ email ,password }) => email && password;


    render() {
        const { email ,password ,errors ,loading } = this.state;
        return (
            <Grid textAlign ="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as="h2" icon color="violet" textAlign="center">
                        <Icon name="home" color="violet"/>
                        Login to Home18
                    </Header>
                    <Form onSubmit= {this.handleSubmit} size="large">
                        <Segment stacked>

                             <Form.Input fluid name="email" icon="mail" iconPosition="left"
                            placeholder ="Email address" onChange={this.handleChange} type="email" 
                            />

                            <Form.Input fluid name="password" icon="lock" iconPosition="left"
                            placeholder ="Password" onChange={this.handleChange} type="password" 
                             />

                            <Button disabled={loading} className={loading? 'loading':''} color="violet" fluid size="large">Login</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 &&(
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>
                        <Link className="backtoLogin" to="/register">Create An Account</Link>
                    </Message>
                </Grid.Column>

            </Grid>
        )
    }
}


export default Login;
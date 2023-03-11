import React from 'react';
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label } from 'semantic-ui-react';
import { SliderPicker } from "react-color";


class ColorPanel extends React.Component {
    state = {
        modal: false
    }

    openModal = () => this.setState({ modal: true });
    closeModal = () => this.setState({ modal: false });

    render () {
        const { modal }= this.state;
        return (
            <Sidebar 
                as={Menu}
                icon="labeled"
                inverted 
                vertical
                visible
                width="very thin"
            >
                <Divider />
                <Button icon="add" size="small" color="blue" onClick={this.openModal}/>
                {/* Color modal */}
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Choose app color</Modal.Header>
                    <Modal.Content>
                        <label Content = "Primary color"/>
                        <SliderPicker />
                        <label Content = "Secondary color"/>
                        <SliderPicker />
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted>
                            <Icon name="checkmark"/> Save color
                        </Button>
                        <Button color="red" inverted>
                            <Icon name="remove"/> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        )
    }
}

export default ColorPanel;
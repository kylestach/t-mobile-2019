/*
<FormControl className={classes.formControl}>
        <InputLabel htmlFor="age-simple">Age</InputLabel>
        <Select
          value={state.age}
          onChange={handleChange}
          inputProps={{
            name: 'age',
            id: 'age-simple',
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
 */

import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import React from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import MaskedInput from "react-text-mask";
import Input from "@material-ui/core/Input";

function TextMaskCustom(props) {
    const { inputRef, ...other } = props;

    return (
        <MaskedInput
            {...other}
            ref={ref => {
                inputRef(ref ? ref.inputElement : null);
            }}
            guide={false}
            mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
            placeholderChar={'\u2000'}
            showMask
        />
    );
}

TextMaskCustom.propTypes = {
    inputRef: PropTypes.func.isRequired,
};

const styles = theme => ({
    root: {
        position: 'relative',
        height: '100%',
    },
    navigator: {
        position: 'fixed',
        width: '100%',
        bottom: '0',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
        maxWidth: 300,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: theme.spacing.unit / 4,
    },
    noLabel: {
        marginTop: theme.spacing.unit * 3,
    },
});

const appointments = [
    {id: 0, firstName: 'Clark', lastName: 'Marks', phone: '(610) 867-5309', time: new Date()},
    {id: 1, firstName: 'Eric', lastName: 'Wunsch', phone: '(404) 867-5309', time: new Date()},
    {id: 2, firstName: 'Yessenia', lastName: 'Bartoletti', phone: '(267) 867-5309', time: new Date()},
];

class AddToQueue extends React.Component {
    state = {
        selectedAppointmentId: "",
        firstName: "",
        lastName: "",
        phone: "",
    };

    handleChange = (e, value) => {
        this.setState({selectedAppointmentId: e.target.value});
    };

    handleTextChange = (key) => {
        return (event) => {
            this.setState({[key]: event.target.value});
        };
    };

    get isAppointment() {
        return this.state.selectedAppointmentId !== "" && appointments[this.state.selectedAppointmentId];
    }

    get customerFirstName() {
        return this.isAppointment ? appointments[this.state.selectedAppointmentId].firstName : this.state.firstName;
    }

    get customerLastName() {
        return this.isAppointment ? "Appt Last" : this.state.lastName;
    }

    get customerPhone() {
        return this.isAppointment ? "(911)-911-0000" : this.state.phone;
    }

    render() {
        const {classes} = this.props;

        console.log(this.state);

        return (<div>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="appointment-simple">Appointment</InputLabel>
                <Select
                    value={this.state.selectedAppointmentId}
                    onChange={this.handleChange}
                    inputProps={{
                        name: 'appointment',
                        id: 'appointment-simple'
                    }}>
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {appointments.map(item => (<MenuItem key={item.id} value={item.id}>{item.firstName + ' ' + item.lastName}</MenuItem>))}
                </Select>
            </FormControl>
            <TextField
                id="first-name"
                label="First Name"
                className={classes.textField}
                value={this.customerFirstName}
                onChange={this.handleTextChange('firstName')}
                disabled={this.isAppointment}
                margin="normal"
            />
            <TextField
                id="last-name"
                label="Last Name"
                className={classes.textField}
                value={this.customerLastName}
                onChange={this.handleTextChange('lastName')}
                disabled={this.isAppointment}
                margin="normal"
            />
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="formatted-text-mask-input">Phone</InputLabel>
                <Input
                    value={this.customerPhone}
                    onChange={this.handleTextChange('phone')}
                    id="formatted-text-mask-input"
                    inputComponent={TextMaskCustom}
                    disabled={this.isAppointment}
                />
            </FormControl>

        </div>);
    }

}

AddToQueue.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddToQueue);